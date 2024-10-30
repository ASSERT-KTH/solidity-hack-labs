from typing import Dict
from constants import PatchFormat
from strategies.base import PatchStrategy
from strategies.bytecode_strategy import BytecodePatchStrategy
from strategies.solidity_strategy import SolidityPatchStrategy
from exceptions import UnsupportedPatchFormatError
from models.patch import Patch

class PatchStrategyFactory:
    def __init__(self):
        self.strategies: Dict[PatchFormat, PatchStrategy] = {
            PatchFormat.SOLIDITY_PATCH: SolidityPatchStrategy(),
            PatchFormat.BYTECODE_PATCH: BytecodePatchStrategy()
        }

    def create_strategy(self, patch: Patch) -> PatchStrategy:
        strategy = self.strategies.get(patch.format)
        if not strategy:
            raise UnsupportedPatchFormatError(f"No strategy available for format: {patch.format}")
        return strategy

    def register_strategy(self, format: PatchFormat, strategy: PatchStrategy):
        self.strategies[format] = strategy