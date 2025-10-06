# Cortex DC Portal - Command Reference

## 🖥️ Terminal Interface Commands

The Cortex DC Portal features an advanced terminal interface with 50+ specialized commands for security operations, POV management, and system administration. This comprehensive reference covers all available commands organized by category.

---

## 📋 Quick Reference

### Command Categories
- **[Basic Commands](#basic-commands)** - Navigation, help, system information
- **[POV Commands](#pov-commands)** - POV creation, management, and execution
- **[Scenario Commands](#scenario-commands)** - Security scenario generation and management
- **[TRR Commands](#trr-commands)** - Technical Requirements Review operations
- **[Management Commands](#management-commands)** - User and system administration
- **[Analytics Commands](#analytics-commands)** - Data analysis and reporting
- **[AI Commands](#ai-commands)** - AI-powered insights and automation
- **[Export Commands](#export-commands)** - Data export and reporting
- **[Competitive Commands](#competitive-commands)** - Competitive analysis tools

### Command Syntax
```bash
command [options] [arguments]

# Examples
help                    # Show help
pov create --name "Customer POV"  # Create POV with name
scenario generate --type ransomware --provider aws  # Generate scenario
```

### Global Options
- `--help, -h` - Show command help
- `--verbose, -v` - Verbose output
- `--json` - JSON output format
- `--quiet, -q` - Suppress non-essential output

---

## 🔧 Basic Commands

### Navigation & Information
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `help` | Show command help and documentation | `help [command]` | `h` |
| `clear` | Clear terminal screen | `clear` | `cls` |
| `ls` | List available commands | `ls [category]` | `list` |
| `whoami` | Show current user information | `whoami` | `user` |
| `version` | Show application version | `version` | `v` |
| `status` | Show system status | `status` | `stat` |
| `pwd` | Show current working context | `pwd` | - |
| `cd` | Change context/directory | `cd <context>` | - |

### System Information
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `sysinfo` | Display system information | `sysinfo` | `info` |
| `uptime` | Show system uptime | `uptime` | - |
| `ping` | Test connectivity | `ping [endpoint]` | - |
| `trace` | Show request trace information | `trace` | - |

**Examples:**
```bash
help pov                    # Get help for POV commands
whoami                      # Show current user details
ls pov                      # List POV-related commands
status                      # Check system status
```

---

## 🎯 POV Commands

### POV Lifecycle Management
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `pov create` | Create new POV | `pov create --name "<name>" [options]` | - |
| `pov list` | List all POVs | `pov list [--status <status>]` | `pov ls` |
| `pov show` | Show POV details | `pov show <pov-id>` | `pov get` |
| `pov update` | Update POV information | `pov update <pov-id> [options]` | - |
| `pov delete` | Delete POV | `pov delete <pov-id>` | `pov rm` |
| `pov clone` | Clone existing POV | `pov clone <pov-id> --name "<new-name>"` | - |

### POV Operations
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `pov start` | Start POV execution | `pov start <pov-id>` | - |
| `pov pause` | Pause POV execution | `pov pause <pov-id>` | - |
| `pov resume` | Resume paused POV | `pov resume <pov-id>` | - |
| `pov stop` | Stop POV execution | `pov stop <pov-id>` | - |
| `pov validate` | Validate POV configuration | `pov validate <pov-id>` | - |
| `pov deploy` | Deploy POV to environment | `pov deploy <pov-id> --env <environment>` | - |

### POV Analytics
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `pov analytics` | Show POV analytics | `pov analytics <pov-id>` | `pov stats` |
| `pov metrics` | Display POV metrics | `pov metrics <pov-id>` | - |
| `pov timeline` | Show POV execution timeline | `pov timeline <pov-id>` | - |

**Examples:**
```bash
pov create --name "Banking Security POV" --customer "First National" --duration "2 weeks"
pov list --status active
pov show pov-123
pov start pov-123
pov analytics pov-123
```

---

## 🔒 Scenario Commands

### Scenario Generation
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `scenario generate` | Generate security scenario | `scenario generate --type <type> [options]` | `gen` |
| `scenario list` | List available scenarios | `scenario list [--category <category>]` | `scenario ls` |
| `scenario show` | Show scenario details | `scenario show <scenario-id>` | - |
| `scenario edit` | Edit scenario parameters | `scenario edit <scenario-id>` | - |
| `scenario delete` | Delete scenario | `scenario delete <scenario-id>` | - |

### Scenario Types & Options
| Type | Description | Providers | Options |
|------|-------------|-----------|---------|
| `ransomware` | Ransomware attack simulation | `aws`, `gcp`, `azure`, `local` | `--severity`, `--targets` |
| `insider-threat` | Insider threat scenario | `local`, `cloud` | `--user-type`, `--access-level` |
| `container-vuln` | Container vulnerability | `k8s`, `docker` | `--image`, `--registry` |
| `cloud-posture` | Cloud security posture | `aws`, `gcp`, `azure` | `--services`, `--compliance` |
| `code-vuln` | Code vulnerability | `github`, `gitlab` | `--language`, `--framework` |
| `supply-chain` | Supply chain attack | `all` | `--component`, `--vector` |

### Scenario Operations
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `scenario run` | Execute scenario | `scenario run <scenario-id>` | - |
| `scenario stop` | Stop running scenario | `scenario stop <scenario-id>` | - |
| `scenario validate` | Validate scenario config | `scenario validate <scenario-id>` | - |
| `scenario export` | Export scenario definition | `scenario export <scenario-id> --format <format>` | - |

**Examples:**
```bash
scenario generate --type ransomware --provider aws --severity high
scenario generate --type insider-threat --user-type admin --access-level privileged
scenario list --category cloud
scenario run scenario-456
scenario export scenario-456 --format json
```

---

## 📋 TRR Commands

### TRR Management
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `trr create` | Create new TRR | `trr create --title "<title>" [options]` | - |
| `trr list` | List TRRs | `trr list [--status <status>]` | `trr ls` |
| `trr show` | Show TRR details | `trr show <trr-id>` | `trr get` |
| `trr update` | Update TRR | `trr update <trr-id> [options]` | - |
| `trr delete` | Delete TRR | `trr delete <trr-id>` | `trr rm` |
| `trr approve` | Approve TRR | `trr approve <trr-id>` | - |
| `trr reject` | Reject TRR | `trr reject <trr-id> --reason "<reason>"` | - |

### TRR Workflow
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `trr submit` | Submit TRR for review | `trr submit <trr-id>` | - |
| `trr review` | Review TRR | `trr review <trr-id>` | - |
| `trr comment` | Add comment to TRR | `trr comment <trr-id> --message "<comment>"` | - |
| `trr assign` | Assign TRR to user | `trr assign <trr-id> --user <user-id>` | - |
| `trr history` | Show TRR history | `trr history <trr-id>` | - |

**Examples:**
```bash
trr create --title "Customer Network Assessment" --priority high
trr list --status pending
trr submit trr-789
trr approve trr-789
trr comment trr-789 --message "Requirements look good, approved for implementation"
```

---

## 👥 Management Commands

### User Management
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `user create` | Create new user | `user create --email <email> [options]` | - |
| `user list` | List users | `user list [--role <role>]` | `user ls` |
| `user show` | Show user details | `user show <user-id>` | `user get` |
| `user update` | Update user information | `user update <user-id> [options]` | - |
| `user delete` | Delete user | `user delete <user-id>` | `user rm` |
| `user activate` | Activate user account | `user activate <user-id>` | - |
| `user deactivate` | Deactivate user account | `user deactivate <user-id>` | - |

### Role Management
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `role assign` | Assign role to user | `role assign <user-id> --role <role>` | - |
| `role remove` | Remove role from user | `role remove <user-id> --role <role>` | - |
| `role list` | List available roles | `role list` | - |
| `permission grant` | Grant permission | `permission grant <user-id> --permission <perm>` | - |
| `permission revoke` | Revoke permission | `permission revoke <user-id> --permission <perm>` | - |

### System Administration
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `admin backup` | Create system backup | `admin backup [--type <type>]` | - |
| `admin restore` | Restore from backup | `admin restore <backup-id>` | - |
| `admin logs` | View system logs | `admin logs [--level <level>]` | - |
| `admin config` | Manage system configuration | `admin config <action> [options]` | - |
| `admin maintenance` | System maintenance mode | `admin maintenance <on|off>` | - |

**Examples:**
```bash
user create --email "consultant@paloaltonetworks.com" --role consultant
user list --role admin
role assign user-123 --role manager
admin logs --level error --since "1 hour ago"
```

---

## 📊 Analytics Commands

### Reporting & Analytics
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `analytics dashboard` | Open analytics dashboard | `analytics dashboard [--period <period>]` | - |
| `analytics pov` | POV analytics report | `analytics pov [pov-id]` | - |
| `analytics user` | User activity analytics | `analytics user [user-id]` | - |
| `analytics trend` | Trend analysis | `analytics trend --metric <metric>` | - |
| `analytics compare` | Compare metrics | `analytics compare --baseline <date>` | - |

### Metrics & KPIs
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `metrics show` | Display key metrics | `metrics show [--category <category>]` | - |
| `metrics export` | Export metrics data | `metrics export --format <format>` | - |
| `kpi summary` | KPI summary report | `kpi summary [--period <period>]` | - |
| `benchmark` | Performance benchmarks | `benchmark [--against <competitor>]` | - |

**Examples:**
```bash
analytics dashboard --period "last 30 days"
analytics pov pov-123
metrics show --category pov-success
benchmark --against "splunk"
```

---

## 🤖 AI Commands

### AI-Powered Analysis
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `ai analyze` | AI-powered analysis | `ai analyze <data-source> [options]` | - |
| `ai recommend` | Get AI recommendations | `ai recommend --context <context>` | - |
| `ai predict` | Predictive analytics | `ai predict --model <model> --data <data>` | - |
| `ai insights` | Generate insights | `ai insights [--topic <topic>]` | - |
| `ai optimize` | Optimization suggestions | `ai optimize <target>` | - |

### Natural Language Processing
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `ai query` | Natural language queries | `ai query "<question>"` | `ask` |
| `ai summarize` | Summarize content | `ai summarize <content>` | - |
| `ai translate` | Translate text | `ai translate "<text>" --to <language>` | - |

**Examples:**
```bash
ai analyze pov-performance --period "last quarter"
ai recommend --context "ransomware defense"
ai query "What are the top security threats this month?"
ai optimize "pov success rate"
```

---

## 📤 Export Commands

### Data Export
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `export pov` | Export POV data | `export pov <pov-id> --format <format>` | - |
| `export trr` | Export TRR data | `export trr <trr-id> --format <format>` | - |
| `export analytics` | Export analytics data | `export analytics [options]` | - |
| `export users` | Export user data | `export users [--role <role>]` | - |
| `export scenarios` | Export scenario definitions | `export scenarios [--type <type>]` | - |

### Report Generation
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `report generate` | Generate custom report | `report generate --template <template>` | - |
| `report schedule` | Schedule recurring report | `report schedule --frequency <freq>` | - |
| `report list` | List available reports | `report list` | - |
| `report download` | Download report | `report download <report-id>` | - |

**Export Formats:**
- `json` - JSON format
- `csv` - Comma-separated values
- `xlsx` - Excel spreadsheet
- `pdf` - PDF document
- `xml` - XML format

**Examples:**
```bash
export pov pov-123 --format pdf
export analytics --period "Q3 2024" --format xlsx
report generate --template "monthly-summary" --output pdf
```

---

## 🏆 Competitive Commands

### Competitive Analysis
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `compete analyze` | Competitive analysis | `compete analyze --competitor <competitor>` | - |
| `compete features` | Feature comparison | `compete features --vs <competitor>` | - |
| `compete pricing` | Pricing comparison | `compete pricing [--competitor <competitor>]` | - |
| `compete advantages` | Show competitive advantages | `compete advantages` | - |
| `compete benchmark` | Benchmark performance | `compete benchmark --metric <metric>` | - |

### Market Intelligence
| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `market trends` | Show market trends | `market trends [--sector <sector>]` | - |
| `market share` | Market share analysis | `market share` | - |
| `threat landscape` | Current threat landscape | `threat landscape [--period <period>]` | - |

**Supported Competitors:**
- `splunk` - Splunk SOAR
- `crowdstrike` - CrowdStrike Falcon
- `microsoft` - Microsoft Sentinel  
- `ibm` - IBM QRadar
- `rapid7` - Rapid7 InsightIDR

**Examples:**
```bash
compete analyze --competitor splunk
compete features --vs crowdstrike  
compete advantages
market trends --sector cybersecurity
```

---

## 🔍 Command Modifiers & Pipes

### Output Formatting
| Modifier | Description | Example |
|----------|-------------|---------|
| `--json` | JSON output format | `pov list --json` |
| `--csv` | CSV output format | `user list --csv` |
| `--table` | Table output format | `trr list --table` |
| `--quiet` | Minimal output | `scenario run --quiet` |
| `--verbose` | Detailed output | `pov create --verbose` |

### Filtering & Searching
| Modifier | Description | Example |
|----------|-------------|---------|
| `--filter` | Filter results | `pov list --filter "status=active"` |
| `--search` | Search content | `trr list --search "network"` |
| `--sort` | Sort results | `user list --sort name` |
| `--limit` | Limit results | `analytics --limit 10` |

### Time-based Filters
| Modifier | Description | Example |
|----------|-------------|---------|
| `--since` | Since timestamp | `logs --since "1 hour ago"` |
| `--until` | Until timestamp | `logs --until yesterday` |
| `--period` | Time period | `analytics --period "last 7 days"` |

---

## 💡 Command Tips & Tricks

### Tab Completion
The terminal supports intelligent tab completion:
```bash
pov <TAB>           # Shows available pov subcommands
pov list --<TAB>    # Shows available options
scenario gen<TAB>   # Completes to "generate"
```

### Command History
Access previous commands:
```bash
↑ ↓                 # Navigate command history
Ctrl+R              # Reverse search history
history             # Show command history
!!                  # Repeat last command
!pov                # Repeat last pov command
```

### Command Chaining
Chain commands with operators:
```bash
pov create --name "Test POV" && pov start $(pov list --last)
scenario generate --type ransomware | scenario run
trr list --status pending || echo "No pending TRRs"
```

### Aliases & Shortcuts
Create custom aliases:
```bash
alias povs='pov list --status active'
alias trrp='trr list --status pending'
alias mystats='analytics user $(whoami --id)'
```

### Environment Variables
Use environment variables:
```bash
export POV_DEFAULT_DURATION="2 weeks"
export TRR_AUTO_ASSIGN=true
pov create --name "New POV"  # Uses default duration
```

---

## 🚨 Error Handling

### Common Error Messages
| Error | Description | Solution |
|-------|-------------|----------|
| `Command not found` | Invalid command | Use `help` to list commands |
| `Permission denied` | Insufficient permissions | Check your role and permissions |
| `Resource not found` | Invalid ID or resource | Verify resource exists with `list` command |
| `Invalid argument` | Wrong argument format | Check command usage with `--help` |
| `Network error` | Connectivity issue | Check network connection |

### Debug Mode
Enable debug output:
```bash
export DEBUG=true
pov create --name "Debug POV"  # Shows detailed debug information
```

### Getting Help
```bash
help                    # General help
help <command>          # Specific command help
<command> --help        # Command usage information
man <command>           # Detailed manual (if available)
```

---

## 📖 Additional Resources

### Documentation Links
- [Command Implementation Guide](../development.md#command-development)
- [API Reference](../api/README.md)
- [User Guides](../user-guides/README.md)
- [Security Guidelines](../security/README.md)

### Support
- **Email**: [support@henryreed.ai](mailto:support@henryreed.ai)
- **Discord**: [Community Server](https://discord.gg/henryreed-ai)
- **GitHub**: [Issues & Discussions](https://github.com/henryreed/henryreed.ai)

---

*This command reference is continuously updated. For the latest commands and features, use the `help` command within the terminal interface.*