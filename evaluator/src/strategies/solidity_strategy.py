import os
from strategies.base import PatchStrategy
from models.patch import Patch
from constants import PatchFormat
from core.file_manager import FileManager
from exceptions import PatchApplicationError

class SolidityPatchStrategy(PatchStrategy):
    SOLIDITY_PATH = os.path.join("contracts/dataset")
    def apply(self, patch: Patch, file_manager: FileManager) -> str:
        if not self.can_handle(patch):
            raise PatchApplicationError("Not a Solidity patch")
        
        if not os.path.exists(patch.path):
            raise PatchApplicationError(f"Patch file not found: {patch.path}")
        contract_path = self.contract_path(patch)

        content = file_manager.read_file(patch.path, absolute=True)
        file_manager.write_file(contract_path, content)


    def can_handle(self, patch: Patch) -> bool:
        return patch.format == PatchFormat.SOLIDITY_PATCH
    
    def contract_path(self, patch: Patch) -> str:
        return os.path.join(self.SOLIDITY_PATH, patch.get_contract_file())

    def compile(self) -> bool:
        return True