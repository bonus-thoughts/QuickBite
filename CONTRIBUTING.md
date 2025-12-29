# Contributing to QuickBite Pattern Monitor

Thank you for your interest in contributing to QuickBite Pattern Monitor! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the problem
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, browser)

### Suggesting Features

Feature requests are welcome! Please open an issue with:
- A clear description of the feature
- Why this feature would be useful
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/bonus-thoughts/QuickBite.git
   cd QuickBite
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

   Commit message format:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for improvements to existing features
   - `Docs:` for documentation changes
   - `Refactor:` for code refactoring

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Add your API keys to .env.local
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Code Style Guidelines

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components focused and single-purpose
- Add TypeScript types for props and functions
- Use meaningful variable and function names

## Testing

Before submitting a PR:
- Test the app in development mode (`npm run dev`)
- Build and test production mode (`npm run build && npm run preview`)
- Check for TypeScript errors (`tsc --noEmit`)
- Verify your changes don't break existing functionality

## API Keys

**Never commit API keys!**
- Always use `.env.local` for sensitive data
- Verify `.env.local` is in `.gitignore`
- Use `.env.example` for documentation only

## Questions?

Feel free to open an issue for any questions about contributing!

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help create a welcoming environment for all contributors

---

Thank you for contributing! 🎉
