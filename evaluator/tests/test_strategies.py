import pytest
import os
import json
from unittest.mock import Mock, patch
from models.patch import Patch
from constants import PatchFormat
from strategies.solidity_strategy import SolidityPatchStrategy
from strategies.bytecode_strategy import BytecodePatchStrategy
from exceptions import PatchApplicationError

@pytest.fixture
def mock_file_manager():
    return Mock()

@pytest.fixture
def solidity_strategy():
    return SolidityPatchStrategy()

@pytest.fixture
def bytecode_strategy():
    return BytecodePatchStrategy()

class TestSolidityPatchStrategy:
    def test_can_handle(self, solidity_strategy):
        patch = Patch(path="patch_test.sol", format=PatchFormat.SOLIDITY_PATCH, contract_file="test.sol", main="Test")
        assert solidity_strategy.can_handle(patch) == True
        
        patch = Patch(path="patch_test.bin", format=PatchFormat.BYTECODE_PATCH, contract_file="test.sol", main="Test")
        assert solidity_strategy.can_handle(patch) == False

    def test_contract_path(self, solidity_strategy):
        patch = Patch(path="patch_test.sol", format=PatchFormat.SOLIDITY_PATCH, contract_file="test.sol", main="Test")
        expected_path = os.path.join("contracts/dataset", patch.get_contract_file())
        assert solidity_strategy.contract_path(patch) == expected_path

    @patch('os.path.exists')
    def test_apply_success(self, mock_exists, solidity_strategy, mock_file_manager):
        mock_exists.return_value = True
        patch = Patch(path="patch_test.sol", format=PatchFormat.SOLIDITY_PATCH, contract_file="test.sol", main="Test")
        
        mock_file_manager.read_file.return_value = "contract content"
        solidity_strategy.apply(patch, mock_file_manager)
        
        mock_file_manager.write_file.assert_called_once_with(
            solidity_strategy.contract_path(patch),
            "contract content"
        )

    @patch('os.path.exists')
    def test_apply_file_not_found(self, mock_exists, solidity_strategy, mock_file_manager):
        mock_exists.return_value = False
        patch = Patch(path="patch_test.sol", format=PatchFormat.SOLIDITY_PATCH, contract_file="test.sol", main="Test")
        
        with pytest.raises(PatchApplicationError, match="Patch file not found"):
            solidity_strategy.apply(patch, mock_file_manager)

class TestBytecodePatchStrategy:
    def test_can_handle(self, bytecode_strategy):
        patch = Patch(path="patch_test.bin", format=PatchFormat.BYTECODE_PATCH, contract_file="test.sol", main="Test")
        assert bytecode_strategy.can_handle(patch) == True
        
        patch = Patch(path="patch_test.sol", format=PatchFormat.SOLIDITY_PATCH, contract_file="test.sol", main="Test")
        assert bytecode_strategy.can_handle(patch) == False

    def test_contract_path(self, bytecode_strategy):
        patch = Patch(path="patch_test.bin", format=PatchFormat.BYTECODE_PATCH, contract_file="test.sol", main="Test")
        expected_path = os.path.join("artifacts/contracts/dataset", 
                                   patch.get_contract_file(),
                                   patch.get_main() + ".json")
        assert bytecode_strategy.contract_path(patch) == expected_path

    @patch('os.path.exists')
    def test_apply_success(self, mock_exists, bytecode_strategy, mock_file_manager):
        mock_exists.return_value = True
        patch = Patch(path="patch_test.bin", format=PatchFormat.BYTECODE_PATCH, contract_file="test.sol", main="Test")
        
        original_bytecode = {
            "bytecode": "0xdeploymentcodebytecode",
            "deployedBytecode": "0xbytecode"
        }
        mock_file_manager.read_file.side_effect = [
            json.dumps(original_bytecode),  # First call returns contract JSON
            "newbytecode"                   # Second call returns patch content
        ]
        
        bytecode_strategy.apply(patch, mock_file_manager)
        
        expected_data = {
            "bytecode": "0xdeploymentcodenewbytecode",
            "deployedBytecode": "0xnewbytecode"
        }
        mock_file_manager.write_file.assert_called_once_with(
            bytecode_strategy.contract_path(patch),
            json.dumps(expected_data, indent=4),
            absolute=True
        )

    @patch('os.path.exists')
    def test_apply_file_not_found(self, mock_exists, bytecode_strategy, mock_file_manager):
        mock_exists.return_value = False
        patch = Patch(path="patch_test.bin", format=PatchFormat.BYTECODE_PATCH, contract_file="test.sol", main="Test")
        
        with pytest.raises(PatchApplicationError, match="Patch file not found"):
            bytecode_strategy.apply(patch, mock_file_manager)
