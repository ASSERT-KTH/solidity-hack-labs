import os
import json
from datetime import datetime
from strategies.base import PatchStrategy
from models.patch import Patch
from constants import PatchFormat
from exceptions import PatchApplicationError
from core.file_manager import FileManager
class BytecodePatchStrategy(PatchStrategy):
    BYTECODE_PATH = os.path.join("artifacts/contracts/dataset")

    def apply(self, patch: Patch, file_manager: FileManager):
        if not self.can_handle(patch):
            raise PatchApplicationError("Not a Bytecode patch")
        
        # Check if patch file exists first
        if not os.path.exists(patch.path):
            raise PatchApplicationError(f"Patch file not found: {patch.path}")
            
        contract_path = self.contract_path(patch)
        data = json.loads(file_manager.read_file(contract_path))
        bytecode = data["bytecode"].replace("0x", "")
        deployed_bytecode = data["deployedBytecode"].replace("0x", "")
        deployment_code = bytecode.replace(deployed_bytecode, "")

        # create a new json with the data from the previous one
        new_data = data.copy()
        patch_data = file_manager.read_file(patch.path, absolute=True)
        new_bytecode = "0x"+ deployment_code + patch_data
        new_deployed_bytecode = "0x" + patch_data
        new_data["bytecode"] = new_bytecode
        new_data["deployedBytecode"] = new_deployed_bytecode

        file_manager.write_file(contract_path, json.dumps(new_data, indent=4))

    def can_handle(self, patch: Patch) -> bool:
        return patch.format == PatchFormat.BYTECODE_PATCH
    
    def contract_path(self, patch: Patch) -> str:
        return os.path.join(self.BYTECODE_PATH, patch.get_contract_file(), patch.get_main() + ".json")
    
    def compile(self) -> bool:
        return False