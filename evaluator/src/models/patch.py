from dataclasses import dataclass
from constants import PatchFormat

@dataclass
class Patch:
    path: str
    contract_file: str
    main: str
    format: PatchFormat
    def get_contract_file(self) -> str:
        return self.contract_file

    def get_path(self) -> str:
        return self.path

    def get_main(self) -> str:
        return self.main