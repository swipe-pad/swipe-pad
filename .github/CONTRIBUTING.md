# Contributing to SwipePad 💖

First off, thank you for considering contributing to SwipePad! We're on a mission to make micro-donations seamless and impactful, and every contribution, no matter how small, helps us get closer to that goal. We're thrilled to have you join our community of changemakers!

This document provides guidelines for contributing to SwipePad. We hope to make it as easy and transparent as possible for you to get involved.

## Code of Conduct 📜

We are committed to fostering an open, welcoming, and inclusive environment. All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please take a moment to read it before you start contributing.

## How Can I Contribute? 🤔

There are many ways you can contribute to SwipePad, beyond writing code:

- 💡 **Suggesting Features:** Have an idea that could make SwipePad better? We'd love to hear it!
- 🐛 **Reporting Bugs:** Found something不 behaving as expected? Let us know!
- 📄 **Improving Documentation:** Help us make our guides clearer and more comprehensive.
- 🎨 **Design and UX:** Share your expertise to enhance the user experience.
- 📢 **Spreading the Word:** Tell your friends and network about SwipePad!
- 🧑‍💻 **Writing Code:** Help us build new features or fix existing issues.

## Getting Started 🚀

If you're ready to contribute code, here's how to get started:

1.  **Fork the Repository:** Click the "Fork" button at the top right of the [SwipePad repository page](https://github.com/ReFi-Starter/swipe-pad).
2.  **Clone Your Fork:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/swipe-pad.git
    cd swipe-pad
    ```
3.  **Set Upstream Remote:**
    ```bash
    git remote add upstream https://github.com/ReFi-Starter/swipe-pad.git
    ```
4.  **Install Dependencies & Setup Environment:** Follow the instructions in our main [README.md](../README.md#getting-started) to set up your development environment and database.
5.  **Create a New Branch:** For each new feature or bug fix, create a descriptive branch:
    ```bash
    # For features
    git checkout -b feature/your-amazing-feature
    # For bug fixes
    git checkout -b fix/squash-that-bug
    ```
    Please use a clear and descriptive branch name (e.g., `feature/user-profile-page`, `fix/donation-button-alignment`).

## Making Changes 💻

- **Coding Standards:**
    - We use Prettier for code formatting and ESLint for linting. Please ensure your code adheres to these standards. You can usually run formatters/linters with `bun run format` or `bun run lint` (verify script names in `package.json`).
    - Write clear, understandable, and maintainable code.
    - Add comments where necessary to explain complex logic.
- **Commit Messages:** We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This helps us maintain a clear commit history and automate changelog generation. Common types include:
    - `feat:` (new feature)
    - `fix:` (bug fix)
    - `docs:` (documentation changes)
    - `style:` (formatting, missing semi colons, etc.; no code logic change)
    - `refactor:` (refactoring production code)
    - `test:` (adding or refactoring tests; no production code change)
    - `chore:` (updating grunt tasks etc; no production code change)
    - Example: `feat(donations): add support for cKES stablecoin`
- **Testing:**
    - If you're adding a new feature, please include relevant tests.
    - Ensure all tests pass before submitting a pull request. You can typically run tests with `bun test` (verify script name in `package.json`).

## Submitting a Pull Request (PR) 📬

Once you're happy with your changes:

1.  **Push Your Branch:**
    ```bash
    git push origin feature/your-amazing-feature
    ```
2.  **Open a Pull Request:** Go to the [SwipePad repository](https://github.com/ReFi-Starter/swipe-pad) and click "New pull request". Select your fork and branch.
3.  **Fill Out the PR Template:** We have a template to guide you. Please provide a clear description of your changes, link to any relevant issues, and include screenshots/GIFs for UI changes if applicable.
4.  **Code Review:** At least one core team member will review your PR. We aim to provide feedback promptly.
5.  **Address Feedback:** Make any necessary changes based on the review.
6.  **Merge:** Once approved, your PR will be merged! 🎉

## Reporting Bugs & Suggesting Features 🐞💡

- **Bugs:** If you find a bug, please check if it has already been reported in the [Issues tab](https://github.com/ReFi-Starter/swipe-pad/issues). If not, create a new issue using our "Bug Report" template.
- **Features:** For feature suggestions, please use the "Feature Request" template in the [Issues tab](https://github.com/ReFi-Starter/swipe-pad/issues) or start a conversation in our [Discussions tab](https://github.com/ReFi-Starter/swipe-pad/discussions).

## Project Management with GitHub Projects 📋

We use [GitHub Projects](https://github.com/users/ReFi-Starter/projects/1) (Update this link if you have a specific project board number) to track our work, manage tasks, and organize our development sprints.

- You can find tasks that are ready for development under columns like "To Do" or "Ready for Dev."
- Issues and Pull Requests will be linked to tasks on the project board to provide a clear overview of progress.
- Feel free to pick up an unassigned issue from the board that interests you! Just leave a comment on the issue to let us know you're working on it.

## Questions or Need Help? 💬

If you have any questions or get stuck, please don't hesitate to:

- Start a new topic in our [Discussions tab](https://github.com/ReFi-Starter/swipe-pad/discussions).
- Comment on a relevant issue.

We're here to help you succeed and make your contribution experience a positive one.

Thank you again for your interest in SwipePad! We look forward to your contributions. Let's build something amazing together! ✨
