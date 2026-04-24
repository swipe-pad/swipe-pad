#!/usr/bin/env bun
/**
 * Security Hardening Validator for SwipePad
 * 
 * Validates that supply-chain security configurations are enforced.
 * Run this in pre-commit hooks and CI to prevent security regression.
 * 
 * Usage:
 *   bun scripts/security-check.ts
 *   bun scripts/security-check.ts --strict  # Fail on warnings too
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  remediation?: string;
}

interface BunfigInstall {
  frozenLockfile?: unknown;
  exact?: unknown;
  saveTextLockfile?: unknown;
  linker?: unknown;
  auto?: unknown;
  minimumReleaseAge?: unknown;
}

interface BunfigConfig {
  telemetry?: unknown;
  env?: unknown;
  install?: BunfigInstall;
}

const ROOT = process.cwd();
const STRICT = process.argv.includes("--strict");

function log(color: string, icon: string, message: string) {
  console.log(`${color}${icon} ${message}\x1b[0m`);
}

function parseToml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split("\n");
  let currentSection: Record<string, unknown> = result;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const section = trimmed.slice(1, -1);
      const parts = section.split(".");
      let target: Record<string, unknown> = result;
      for (const part of parts) {
        if (!target[part]) target[part] = {} as Record<string, unknown>;
        target = target[part] as Record<string, unknown>;
      }
      currentSection = target;
      continue;
    }
    
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    
    if (value === "true") currentSection[key] = true;
    else if (value === "false") currentSection[key] = false;
    else if (value.startsWith('"') && value.endsWith('"')) {
      currentSection[key] = value.slice(1, -1);
    } else if (value.startsWith("[") && value.endsWith("]")) {
      currentSection[key] = value.slice(1, -1).split(",").map(v => v.trim()).filter(Boolean);
    } else if (!isNaN(Number(value))) {
      currentSection[key] = Number(value);
    } else {
      currentSection[key] = value;
    }
  }
  
  return result;
}

function checkBunfig(): CheckResult[] {
  const results: CheckResult[] = [];
  const bunfigPath = join(ROOT, "bunfig.toml");
  
  if (!existsSync(bunfigPath)) {
    return [{
      name: "bunfig.toml exists",
      status: "fail",
      message: "bunfig.toml not found",
      remediation: "Create bunfig.toml with security hardening configuration"
    }];
  }
  
  const content = readFileSync(bunfigPath, "utf-8");
  const config = parseToml(content) as BunfigConfig;
  
  // Check telemetry disabled
  results.push({
    name: "telemetry disabled",
    status: config.telemetry === false ? "pass" : "fail",
    message: config.telemetry === false 
      ? "Telemetry is disabled" 
      : `Telemetry is ${config.telemetry}`,
    remediation: "Set telemetry = false in bunfig.toml"
  });
  
  // Check auto .env loading disabled
  results.push({
    name: "auto .env loading disabled",
    status: config.env === false ? "pass" : "warn",
    message: config.env === false
      ? "Automatic .env loading is disabled"
      : "Automatic .env loading is enabled",
    remediation: "Set env = false in bunfig.toml"
  });
  
  // Check install settings
  const install = config.install || {};
  
  results.push({
    name: "frozenLockfile enabled",
    status: install.frozenLockfile === true ? "pass" : "fail",
    message: install.frozenLockfile === true
      ? "Lockfile is frozen"
      : "Lockfile is NOT frozen",
    remediation: "Set [install] frozenLockfile = true"
  });
  
  results.push({
    name: "exact versions",
    status: install.exact === true ? "pass" : "fail",
    message: install.exact === true
      ? "Exact versions enforced"
      : "Exact versions NOT enforced",
    remediation: "Set [install] exact = true"
  });
  
  results.push({
    name: "text lockfile",
    status: install.saveTextLockfile === true ? "pass" : "fail",
    message: install.saveTextLockfile === true
      ? "Text lockfile enabled for auditability"
      : "Text lockfile NOT enabled",
    remediation: "Set [install] saveTextLockfile = true"
  });
  
  results.push({
    name: "isolated linker",
    status: install.linker === "isolated" ? "pass" : "fail",
    message: install.linker === "isolated"
      ? "Isolated linker prevents dependency confusion"
      : `Linker is "${install.linker}" - dependency confusion risk`,
    remediation: "Set [install] linker = \"isolated\""
  });
  
  results.push({
    name: "auto-install disabled",
    status: install.auto === "disable" ? "pass" : "warn",
    message: install.auto === "disable"
      ? "Auto-installation is disabled"
      : `Auto-installation is "${install.auto}"`,
    remediation: "Set [install] auto = \"disable\""
  });
  
  results.push({
    name: "minimumReleaseAge",
    status: typeof install.minimumReleaseAge === "number" && install.minimumReleaseAge >= 604800
      ? "pass" : "warn",
    message: typeof install.minimumReleaseAge === "number"
      ? `Minimum release age: ${install.minimumReleaseAge}s (${Math.round(install.minimumReleaseAge / 86400)} days)`
      : "Minimum release age not set",
    remediation: "Set [install] minimumReleaseAge = 604800 (7 days)"
  });
  
  return results;
}

function checkPackageJson(): CheckResult[] {
  const results: CheckResult[] = [];
  const pkgPath = join(ROOT, "package.json");
  
  if (!existsSync(pkgPath)) {
    return [{
      name: "package.json exists",
      status: "fail",
      message: "package.json not found",
      remediation: "Create package.json"
    }];
  }
  
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  
  results.push({
    name: "trustedDependencies empty",
    status: Array.isArray(pkg.trustedDependencies) && pkg.trustedDependencies.length === 0
      ? "pass" : "warn",
    message: Array.isArray(pkg.trustedDependencies)
      ? `trustedDependencies has ${pkg.trustedDependencies.length} packages`
      : "trustedDependencies not defined",
    remediation: "Set \"trustedDependencies\": [] in package.json"
  });
  
  // Check for engines field to enforce Node/Bun versions
  results.push({
    name: "engines field",
    status: pkg.engines ? "pass" : "warn",
    message: pkg.engines
      ? `Engines: ${JSON.stringify(pkg.engines)}`
      : "No engines field defined",
    remediation: "Add engines field to enforce minimum Node/Bun versions"
  });
  
  return results;
}

function checkNpmrc(): CheckResult[] {
  const results: CheckResult[] = [];
  const npmrcPath = join(ROOT, ".npmrc");
  
  if (!existsSync(npmrcPath)) {
    return [{
      name: ".npmrc exists",
      status: "warn",
      message: ".npmrc not found",
      remediation: "Create .npmrc with ignore-scripts=true"
    }];
  }
  
  const content = readFileSync(npmrcPath, "utf-8");
  
  results.push({
    name: ".npmrc ignore-scripts",
    status: content.includes("ignore-scripts=true") ? "pass" : "warn",
    message: content.includes("ignore-scripts=true")
      ? ".npmrc has ignore-scripts=true"
      : ".npmrc missing ignore-scripts=true",
    remediation: "Add ignore-scripts=true to .npmrc"
  });
  
  results.push({
    name: ".npmrc registry",
    status: content.includes("registry=https://registry.npmjs.org") ? "pass" : "warn",
    message: content.includes("registry=https://registry.npmjs.org")
      ? ".npmrc uses official npm registry"
      : ".npmrc may use custom registry",
    remediation: "Add registry=https://registry.npmjs.org to .npmrc"
  });
  
  return results;
}

function checkGitHooks(): CheckResult[] {
  const results: CheckResult[] = [];
  const hooksDir = join(ROOT, ".githooks");
  
  if (!existsSync(hooksDir)) {
    return [{
      name: "git hooks directory",
      status: "warn",
      message: ".githooks directory not found",
      remediation: "Create .githooks/ with pre-commit and pre-push hooks"
    }];
  }
  
  const preCommitPath = join(hooksDir, "pre-commit");
  results.push({
    name: "pre-commit hook",
    status: existsSync(preCommitPath) ? "pass" : "warn",
    message: existsSync(preCommitPath)
      ? "pre-commit hook exists"
      : "pre-commit hook missing",
    remediation: "Create .githooks/pre-commit"
  });
  
  return results;
}

// Main execution
console.log("🔒 SwipePad Security Hardening Check\n");

const allResults = [
  ...checkBunfig(),
  ...checkPackageJson(),
  ...checkNpmrc(),
  ...checkGitHooks()
];

let passCount = 0;
let failCount = 0;
let warnCount = 0;

for (const result of allResults) {
  if (result.status === "pass") {
    passCount++;
    log("\x1b[32m", "✓", `${result.name}: ${result.message}`);
  } else if (result.status === "fail") {
    failCount++;
    log("\x1b[31m", "✗", `${result.name}: ${result.message}`);
    if (result.remediation) {
      log("\x1b[33m", "  →", `Fix: ${result.remediation}`);
    }
  } else {
    warnCount++;
    log("\x1b[33m", "⚠", `${result.name}: ${result.message}`);
    if (result.remediation) {
      log("\x1b[90m", "  →", `Suggestion: ${result.remediation}`);
    }
  }
}

console.log("\n" + "=".repeat(50));
console.log(`Results: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);

if (failCount > 0) {
  console.log("\n❌ Security check FAILED");
  process.exit(1);
}

if (STRICT && warnCount > 0) {
  console.log("\n⚠️  Security check FAILED (--strict mode)");
  process.exit(1);
}

console.log("\n✅ Security check passed");
process.exit(0);
