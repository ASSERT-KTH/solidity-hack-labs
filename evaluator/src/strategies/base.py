from abc import ABC, abstractmethod
from models.patch import Patch
from core.file_manager import FileManager
class PatchStrategy(ABC):

    @abstractmethod
    def apply(self, patch: Patch, file_manager: FileManager):
        pass

    @abstractmethod
    def can_handle(self, patch: Patch) -> bool:
        pass
    
    @abstractmethod
    def contract_path(self, patch: Patch) -> str:
        pass
    
    @abstractmethod
    def compile(self) -> bool:
        pass