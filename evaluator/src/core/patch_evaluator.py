from models.patch import Patch
from models.test_result import TestResult
from core.file_manager import FileManager
from core.strategy_factory import PatchStrategyFactory
from testing.hardhat_runner import HardhatTestRunner
import logging

class PatchEvaluator:
    def __init__(self, base_directory: str):
        self.file_manager = FileManager(base_directory)
        self.patch_factory = PatchStrategyFactory()
        self.test_runner = HardhatTestRunner(base_directory)
        self.logger = logging.getLogger(__name__)

    def evaluate_patch(self, patch: Patch) -> TestResult:
        strategy = self.patch_factory.create_strategy(patch)
        self.logger.info(f"Evaluating patch: {patch.path} for contract: {patch.contract_file}")
        
        try:
            contract_path = strategy.contract_path(patch)
            self.logger.debug(f"Backing up contract at: {contract_path}")
            self.file_manager.backup(contract_path)

            self.logger.info("Applying patch...")
            strategy.apply(patch, self.file_manager)

            self.logger.info("Running tests...")
            test_result = self.test_runner.run_tests(patch, strategy)

            self.logger.debug("Restoring original contract")
            self.file_manager.restore(contract_path)

            self.logger.info(f"Evaluation complete. Passed tests: {test_result.passed_tests}/{test_result.total_tests}")
            return test_result

        except Exception as e:
            self.logger.error(f"Error during patch evaluation: {str(e)}")
            self.file_manager.restore(strategy.contract_path(patch))
            return TestResult(
                failures_sanity=list(e),
                failures_exploits=[0],
                total_tests=0,
                passed_tests=0,
                sanity_success=0,
                sanity_failures=0
            )
        finally:
            self.file_manager.remove_backup()