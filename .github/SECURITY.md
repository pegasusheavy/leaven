# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Leaven seriously. If you believe you have found a security vulnerability, please report it to us privately.

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report

1. **Email**: Send an email to security@pegasusheavy.com with:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Any suggested fixes (optional)

2. **GitHub Security Advisories**: You can also use [GitHub's private vulnerability reporting](https://github.com/pegasusheavy/leaven/security/advisories/new).

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours.
- **Communication**: We will keep you informed of our progress toward a fix.
- **Timeline**: We aim to release a fix within 90 days of confirmation.
- **Credit**: We will publicly credit you for the discovery (unless you prefer to remain anonymous).

### Scope

The following are in scope for security reports:

- All `@leaven-graphql/*` packages
- The Leaven documentation site
- Any official Leaven tooling or integrations

### Out of Scope

- Vulnerabilities in dependencies (please report these to the respective maintainers)
- Denial of service attacks
- Social engineering attacks
- Physical security issues

## Security Best Practices

When using Leaven in production:

1. **Disable introspection** in production:
   ```typescript
   createExecutor({ schema, introspection: false });
   ```

2. **Set query complexity limits**:
   ```typescript
   createExecutor({
     schema,
     maxDepth: 10,
     maxComplexity: 1000
   });
   ```

3. **Use HTTPS** for all GraphQL endpoints

4. **Implement rate limiting** at the HTTP layer

5. **Validate and sanitize** all user inputs

6. **Keep dependencies updated** regularly

## Security Updates

Security updates are released as patch versions. We recommend:

- Subscribing to [GitHub Security Advisories](https://github.com/pegasusheavy/leaven/security/advisories)
- Using [Dependabot](https://github.com/dependabot) to keep dependencies updated
- Monitoring the [releases page](https://github.com/pegasusheavy/leaven/releases) for security announcements
