# Contributing Guide

Thank you for your interest in contributing to the Language Coach App! This guide will help you get started with the development workflow and coding standards.

## Development Workflow

### 1. Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/language-coach-app.git
   cd language-coach-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Follow the [Getting Started Guide](getting-started.md) to set up your environment

### 2. Creating a Feature

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Add tests for new functionality
4. Run the test suite:
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```
5. Commit your changes using conventional commits:
   ```bash
   git commit -m "feat: add amazing new feature"
   ```

### 3. Submitting Changes

1. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request on GitHub
3. Ensure CI checks pass
4. Request review from maintainers

## Code Standards

### TypeScript

- **Strict mode enabled** - All code must pass TypeScript strict checks
- **Explicit return types** for all functions
- **No `any` types** - Use proper typing or `unknown`
- **Consistent naming** - camelCase for variables, PascalCase for components

```typescript
// Good
function calculateProgress(sessions: Session[]): ProgressData {
  return {
    totalSessions: sessions.length,
    averageAccuracy: sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length
  };
}

// Bad
function calculateProgress(sessions: any): any {
  // implementation
}
```

### React Components

- **Functional components** with hooks
- **TypeScript interfaces** for all props
- **Consistent file naming** - PascalCase for components
- **Props destructuring** in function signature

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

### Styling Guidelines

- **Tailwind CSS utility classes** for styling
- **Semantic class names** for complex components
- **Responsive design** with mobile-first approach
- **Accessibility compliance** - WCAG 2.1 AA standards

```typescript
// Good
<button className="btn-primary px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
  Submit
</button>

// Avoid inline styles
<button style={{ padding: '8px 16px', backgroundColor: 'blue' }}>
  Submit
</button>
```

### API Design

- **RESTful conventions** for endpoint design
- **Consistent error handling** with proper HTTP status codes
- **Input validation** using Zod schemas
- **TypeScript types** for request/response objects

```typescript
// API route example
import { z } from 'zod';

const analyzeSchema = z.object({
  transcript: z.string().min(1),
  context: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, context } = analyzeSchema.parse(body);
    
    // Process request
    const result = await analyzeGrammar(transcript, context);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }
}
```

## Testing Guidelines

### Unit Tests

- **Test all utility functions** and custom hooks
- **Mock external dependencies** (APIs, database)
- **Focus on behavior** not implementation details

```typescript
// Good test
describe('calculateAccuracy', () => {
  it('returns correct percentage for mixed results', () => {
    const mistakes = [
      { category: 'grammar', correct: true },
      { category: 'spelling', correct: false },
      { category: 'grammar', correct: true }
    ];
    
    expect(calculateAccuracy(mistakes)).toBe(66.67);
  });
});
```

### Component Tests

- **Test user interactions** and state changes
- **Use React Testing Library** for DOM testing
- **Test accessibility** features

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

Examples:
```bash
feat: add audio recording functionality
fix: resolve transcription timeout issue
docs: update API documentation
style: format components with prettier
refactor: extract common validation logic
test: add integration tests for auth flow
chore: update dependencies
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] No console.log statements in production code
- [ ] Documentation updated if needed
- [ ] Self-review completed

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to demonstrate UI changes.

## Additional Notes
Any additional context or notes for reviewers.
```

## Getting Help

- **GitHub Issues** - Report bugs or request features
- **Discussions** - Ask questions or propose ideas
- **Code Review** - Tag maintainers for review help

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help newcomers learn and contribute

Thank you for contributing to Language Coach App! 🎉