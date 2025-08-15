# Documentation

Welcome to the Language Coach App documentation! This directory contains both public documentation (committed to git) and local development files (gitignored).

## 📚 Public Documentation (Committed)

These files are part of the repository and provide essential information for users and contributors:

- **[Getting Started Guide](getting-started.md)** - Complete setup instructions
- **[Architecture Guide](architecture.md)** - System design and technical decisions  
- **[API Documentation](api.md)** - Complete API reference with examples
- **[Contributing Guide](contributing.md)** - Development workflow and standards

## 🔒 Local Development Files (Gitignored)

These directories contain local-only files for development reference:

```
docs/
├── accessibility-reports/      # WCAG compliance analysis
├── performance-audits/         # Lighthouse and performance reports  
├── claude-code-logs/           # AI development session logs
├── development-notes/          # Personal notes and planning
└── testing-reports/           # Test coverage and results
```

## File Organization

### What Gets Committed
✅ **Core documentation** - Setup, architecture, API, contributing guides  
✅ **Assets** - Diagrams, screenshots, and visual aids  
✅ **Templates** - Issue templates, PR templates  

### What Stays Local  
🔒 **Development logs** - Claude Code conversation histories  
🔒 **Analysis reports** - Accessibility, performance, security audits  
🔒 **Personal notes** - TODO lists, research, planning documents  
🔒 **Test artifacts** - Coverage reports, test screenshots  

## Quick Access

Create shell aliases for quick navigation:

```bash
# Add to your .bashrc or .zshrc
alias docs="cd /path/to/language-coach-app/docs"
alias ldocs="open /path/to/language-coach-app/docs"
```

## Usage Guidelines

### For Contributors
1. **Read public docs first** - Start with getting-started.md
2. **Update docs with changes** - Keep documentation current
3. **Use local folders freely** - Perfect for notes and analysis

### For Development
1. **Save Claude Code outputs** to appropriate local subdirectories
2. **Document decisions** in development-notes/
3. **Track performance** in performance-audits/
4. **Keep sensitive data** in local folders only

## Git Integration

The documentation setup uses selective gitignore patterns:

```gitignore
# Exclude local development folders
docs/accessibility-reports/
docs/performance-audits/
docs/claude-code-logs/
docs/development-notes/
docs/testing-reports/

# Include public documentation
!docs/
!docs/*.md
!docs/assets/
```

This ensures clean public documentation while providing space for comprehensive local development files.

---

*Last updated: August 15, 2025*