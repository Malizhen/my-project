# CLAUDE.MD

## Project Information

This is the configuration file for Claude Code and AI assistant interactions with this project.

## Development Guidelines

### Code Style
- Follow existing code conventions in the project
- Write clear, concise code with minimal comments
- Only add comments where logic isn't self-evident
- Keep solutions focused and avoid over-engineering

### Making Changes
- Always read files before proposing modifications
- Avoid unnecessary refactoring or additional "improvements"
- Don't add error handling for scenarios that can't happen
- Don't create helpers or utilities for one-time operations
- Delete unused code completely rather than renaming

### Git Workflow
- Work on designated feature branches (starting with `claude/`)
- Create clear, descriptive commit messages
- Commit work frequently as you complete tasks
- Push to the specified branch when changes are complete

### Task Management
- Use TodoWrite tool to plan and track complex tasks
- Break down larger tasks into actionable steps
- Mark tasks as completed immediately after finishing

## Security Considerations
- Be aware of OWASP top 10 vulnerabilities (XSS, SQL injection, command injection, etc.)
- Validate input at system boundaries only
- Trust internal code and framework guarantees
- Report any security issues immediately

## When Asking for Help
- Run `/help` command in Claude Code for CLI help
- Report issues at https://github.com/anthropics/claude-code/issues
- Provide clear context and reproduction steps for bugs
