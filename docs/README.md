# Local Development Documentation

> **Note**: This `docs/` directory is excluded from git commits. All files here are for local development reference only and will not be pushed to the remote repository.

## Purpose

This directory contains development documentation, reports, and analysis files generated during the development process. These files are useful for local development but are kept separate from the main repository to maintain a clean remote branch.

## Directory Structure

```
docs/
├── README.md                    # This file
├── accessibility-reports/      # WCAG compliance reports
├── performance-audits/         # Performance analysis reports
├── claude-code-logs/           # Claude Code development logs
├── development-notes/          # Personal development notes
└── testing-reports/           # Test coverage and results
```

## File Types

### Accessibility Reports
- **WCAG 2.1 AA compliance** analysis
- **Screen reader compatibility** testing
- **Color contrast** validation
- **Keyboard navigation** testing results

### Performance Audits
- **Lighthouse reports** with detailed metrics
- **Core Web Vitals** measurements
- **Bundle size analysis** and optimization recommendations
- **Database query performance** analysis

### Claude Code Logs
- **Feature development** conversation logs
- **Code review** discussions
- **Architecture decisions** and rationale
- **Troubleshooting** sessions

### Development Notes
- **Personal reminders** and TODO items
- **Feature specifications** and requirements
- **API design decisions** and iterations
- **Database schema** evolution notes

### Testing Reports
- **Unit test coverage** reports
- **Integration test** results
- **E2E test** scenarios and outcomes
- **Performance test** benchmarks

## Usage Guidelines

1. **Add files freely** - All content here stays local
2. **Organize by category** - Use appropriate subdirectories
3. **Include timestamps** - Help track development progress
4. **Reference from code** - Link to relevant docs in comments
5. **Keep sensitive data here** - Perfect for API keys, test credentials

## Integration with Claude Code

Claude Code automatically generates various analysis files. Configure Claude Code to save them here:

```bash
# In your Claude Code settings
export CLAUDE_DOCS_PATH="./docs/"
```

Common generated files:
- `accessibility-compliance-report.md`
- `performance-audit-yyyy-mm-dd.md`
- `security-analysis.md`
- `code-quality-report.md`

## Git Status

✅ **Excluded from git** - Files here won't appear in `git status`  
✅ **No accidental commits** - `.gitignore` prevents inclusion  
✅ **Clean remote branch** - Repository stays focused on code  

## Quick Access

Create aliases for quick access:

```bash
# Add to your shell profile
alias docs="cd /path/to/language-coach-app/docs"
alias adocs="open /path/to/language-coach-app/docs/accessibility-reports"
alias pdocs="open /path/to/language-coach-app/docs/performance-audits"
```

---

*Last updated: $(date)*