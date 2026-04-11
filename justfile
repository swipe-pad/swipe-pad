set shell := ["bash", "-cu"]

default:
  @just --list

dev:
  bun run dev

dev-stop:
  pkill -f "next dev --port 3030" || true

dev-reset:
  pkill -f "next dev --port 3030" || true
  rm -f .next/dev/lock

dev-restart:
  just dev-reset
  bun run dev

logs-web lines="200":
  sudo journalctl -u swipe-pad-web -n {{lines}} --no-pager

logs-web-follow lines="200":
  sudo journalctl -u swipe-pad-web -n {{lines}} -f --no-pager

logs-caddy since="15 minutes ago":
  sudo journalctl -u caddy --since "{{since}}" --no-pager

service-status:
  sudo systemctl status swipe-pad-web --no-pager

service-restart:
  sudo systemctl restart swipe-pad-web
  sudo systemctl status swipe-pad-web --no-pager

logs-user lines="200":
  journalctl --user -n {{lines}} --no-pager

logs-user-follow lines="200":
  journalctl --user -n {{lines}} -f --no-pager

perf-feed n="5" base="http://127.0.0.1:3030":
  for i in $(seq 1 {{n}}); do \
    curl -s -o "/tmp/swipepad-feed-$i.json" -w "feed_$i status=%{http_code} bytes=%{size_download} total=%{time_total}s\\n" "{{base}}/api/feed?seed=just-perf-$i"; \
  done

perf-home base="http://127.0.0.1:3030":
  curl -s -o /dev/null -w "home status=%{http_code} bytes=%{size_download} ttfb=%{time_starttransfer}s total=%{time_total}s\\n" "{{base}}/"

verify:
  bun run typecheck
  bun run test
  bun run test:e2e
  bun run build

ops-sync:
  bun --env-file .env ops/system/scripts/ops-sync.js

ops-sync-apply:
  bun --env-file .env ops/system/scripts/ops-sync.js --apply

vercel-pull env="production":
  bunx vercel pull --yes --environment {{env}}

vercel-prebuild-prod:
  bunx vercel pull --yes --environment production
  bunx vercel build --prod

vercel-deploy-prebuilt-prod:
  bunx vercel deploy --prebuilt --prod

snapshot-local n="5":
  @echo "target,run,status,dns,connect,ttfb,total"
  for i in $(seq 1 {{n}}); do curl -s -o /dev/null -w "localhost-home,$i,%{http_code},%{time_namelookup},%{time_connect},%{time_starttransfer},%{time_total}\n" "http://127.0.0.1:3030/"; done
  for i in $(seq 1 {{n}}); do curl -s -o /dev/null -w "localhost-feed,$i,%{http_code},%{time_namelookup},%{time_connect},%{time_starttransfer},%{time_total}\n" "http://127.0.0.1:3030/api/feed?seed=local-$i"; done
  for i in $(seq 1 {{n}}); do curl --max-time 20 -s -o /dev/null -w "localhost-img,$i,%{http_code},%{time_namelookup},%{time_connect},%{time_starttransfer},%{time_total}\n" "http://127.0.0.1:3030/api/img?u=https%3A%2F%2Fimagedelivery.net%2FBXluQx4ige9GuW0Ia56BHw%2F64c851c0-2036-4629-ead7-ae60bfc62500%2Foriginal&w=1080&q=75"; done

snapshot-caddy n="5":
  @echo "target,run,status,dns,connect,ttfb,total"
  for i in $(seq 1 {{n}}); do curl -k -s -o /dev/null -w "caddy-home,$i,%{http_code},%{time_namelookup},%{time_connect},%{time_starttransfer},%{time_total}\n" --resolve swipe.lady:443:10.200.200.1 "https://swipe.lady/"; done
  for i in $(seq 1 {{n}}); do curl -k -s -o /dev/null -w "caddy-feed,$i,%{http_code},%{time_namelookup},%{time_connect},%{time_starttransfer},%{time_total}\n" --resolve swipe.lady:443:10.200.200.1 "https://swipe.lady/api/feed?seed=caddy-$i"; done
  for i in $(seq 1 {{n}}); do curl --max-time 20 -k -s -o /dev/null -w "caddy-img,$i,%{http_code},%{time_namelookup},%{time_connect},%{time_starttransfer},%{time_total}\n" --resolve swipe.lady:443:10.200.200.1 "https://swipe.lady/api/img?u=https%3A%2F%2Fimagedelivery.net%2FBXluQx4ige9GuW0Ia56BHw%2F64c851c0-2036-4629-ead7-ae60bfc62500%2Foriginal&w=1080&q=75"; done

snapshot-remote host="ghost3" n="5":
  ssh {{host}} 'echo "target,run,status,dns,connect,ttfb,total"; for i in $(seq 1 {{n}}); do curl -k -s -o /dev/null -w "remote-home,$i,%{http_code},%{time_namelookup},%{time_connect},%{time_starttransfer},%{time_total}\n" "https://swipe.lady/"; done; for i in $(seq 1 {{n}}); do curl -k -s -o /dev/null -w "remote-feed,$i,%{http_code},%{time_namelookup},%{time_connect},%{time_starttransfer},%{time_total}\n" "https://swipe.lady/api/feed?seed=remote-$i"; done; for i in $(seq 1 {{n}}); do curl --max-time 20 -k -s -o /dev/null -w "remote-img,$i,%{http_code},%{time_namelookup},%{time_connect},%{time_starttransfer},%{time_total}\n" "https://swipe.lady/api/img?u=https%3A%2F%2Fimagedelivery.net%2FBXluQx4ige9GuW0Ia56BHw%2F64c851c0-2036-4629-ead7-ae60bfc62500%2Foriginal&w=1080&q=75"; done'

# Agent setup and management
agent-setup tool="opencode":
  bun run scripts/agent-setup.ts {{tool}}

agent-clean:
  bun run scripts/agent-setup.ts clean

agent-list:
  bun run scripts/agent-setup.ts --help
