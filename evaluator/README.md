# Patch Evaluator

A tool for evaluating smart contract patches by running test suites and analyzing results.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd evaluator
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv .venv
source .venv/bin/activate
```

3. Install the package in development mode:
```bash
pip install -e ".[dev]"
```

## Configuration

The tool uses several configuration settings that can be modified in `src/config.py`:

- `BASE_DIR`: Base directory for hardhat project
- `LOG_LEVEL`: Logging verbosity (default: "ERROR")
- `DEFAULT_BACKUP_SUFFIX`: Suffix for backup files (default: ".bak")

## Usage

The evaluator can be run from the command line with the following arguments:

```bash
python src/main.py \
    --format <solidity|bytecode> \
    --patch <path-to-patch-file> \
    --contract-file <path-to-contract> \
    --main-contract <contract-name>
```

### Required Arguments

- `--format`: The format of the patch file (choices: 'solidity' or 'bytecode')
- `--patch`: Path to the patch file that will be evaluated
- `--contract-file`: Path to the original smart contract file
- `--main-contract`: Name of the main contract to be patched

### Example

```bash
python src/main.py \
    --format solidity \
    --patch ./patches/fix.sol \
    --contract-file ./contracts/vulnerable.sol \
    --main-contract VulnerableContract
```

## Output

The tool will output evaluation results including:
- Contract and patch file information
- Total number of tests run
- Number of passed tests
- Sanity check results
- Details of any test failures

Example output:
```
Evaluation Results:
Contract File: ./contracts/vulnerable.sol
Patch File: ./patches/fix.sol
Total Tests: 10
Passed Tests: 8
Sanity Success: True
Sanity Failures: 0

Exploit Test Failures:
- Test case #3: Invalid state after transfer
- Test case #7: Reentrancy vulnerability still present
```

## Development

To run tests:
```bash
pytest
```

To run tests with coverage:
```bash
pytest --cov=src
```

