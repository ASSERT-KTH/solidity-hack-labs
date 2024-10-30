import os
import shutil
from config import DEFAULT_BACKUP_SUFFIX
from exceptions import PatchEvaluatorError

class FileManager:
    def __init__(self, base_directory: str):
        self.base_directory = base_directory
        self.backup_directory = os.path.join(base_directory, "backups")
        os.makedirs(self.backup_directory, exist_ok=True)

    def read_file(self, path: str, absolute: bool = False) -> str:
        full_path = os.path.join(self.base_directory, path) if not absolute else path
        try:
            with open(full_path, 'r') as f:
                return f.read()
        except IOError as e:
            raise PatchEvaluatorError(f"Failed to read file {path}: {str(e)}")

    def write_file(self, path: str, content: str, absolute: bool = False):
        full_path = os.path.join(self.base_directory, path) if not absolute else path
        try:
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'w') as f:
                f.write(content)
        except IOError as e:
            raise PatchEvaluatorError(f"Failed to write file {path}: {str(e)}")

    def backup(self, path: str):
        source = os.path.join(self.base_directory, path)
        print(f"Backing up file {source} to {self.backup_directory}")
        backup = f"{os.path.join(self.backup_directory, path)}{DEFAULT_BACKUP_SUFFIX}"
        os.makedirs(os.path.dirname(backup), exist_ok=True)
        try:
            shutil.copy2(source, backup)
        except IOError as e:
            raise PatchEvaluatorError(f"Failed to backup file {path}: {str(e)}")

    def restore(self, path: str):
        source = os.path.join(self.base_directory, path)
        backup = f"{os.path.join(self.backup_directory, path)}{DEFAULT_BACKUP_SUFFIX}"
        try:
            if os.path.exists(backup):
                shutil.move(backup, source)
        except IOError as e:
            raise PatchEvaluatorError(f"Failed to restore file {path}: {str(e)}")
    
    def remove_backup(self):
        if os.path.exists(self.backup_directory):
            shutil.rmtree(self.backup_directory)
