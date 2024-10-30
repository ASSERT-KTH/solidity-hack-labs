import os
import pytest
from core.file_manager import FileManager
from exceptions import PatchEvaluatorError

class TestFileManager:
    @pytest.fixture
    def test_dir(self, tmp_path):
        return str(tmp_path)

    @pytest.fixture
    def file_manager(self, test_dir):
        return FileManager(test_dir)

    def test_init_creates_backup_directory(self, test_dir):
        FileManager(test_dir)
        backup_dir = os.path.join(test_dir, "backups")
        assert os.path.exists(backup_dir)

    def test_read_file(self, file_manager, test_dir):
        # Create a test file
        test_content = "test content"
        test_file = os.path.join(test_dir, "test.txt")
        with open(test_file, 'w') as f:
            f.write(test_content)

        # Test relative path
        assert file_manager.read_file("test.txt") == test_content
        # Test absolute path
        assert file_manager.read_file(test_file, absolute=True) == test_content

    def test_read_file_error(self, file_manager):
        with pytest.raises(PatchEvaluatorError):
            file_manager.read_file("nonexistent.txt")

    def test_write_file(self, file_manager, test_dir):
        test_content = "new content"
        
        # Test relative path
        file_manager.write_file("test.txt", test_content)
        assert os.path.exists(os.path.join(test_dir, "test.txt"))
        
        # Test absolute path
        abs_path = os.path.join(test_dir, "absolute.txt")
        file_manager.write_file(abs_path, test_content, absolute=True)
        assert os.path.exists(abs_path)

    def test_write_file_nested_directory(self, file_manager, test_dir):
        test_content = "nested content"
        file_manager.write_file("nested/dir/test.txt", test_content)
        assert os.path.exists(os.path.join(test_dir, "nested/dir/test.txt"))

    def test_backup_and_restore(self, file_manager, test_dir):
        # Create original file
        original_content = "original content"
        test_file = "test.txt"
        file_manager.write_file(test_file, original_content)
        
        # Backup the file
        file_manager.backup(test_file)
        backup_path = os.path.join(test_dir, "backups", f"{test_file}.bak")
        assert os.path.exists(backup_path)
        
        # Modify original file
        modified_content = "modified content"
        file_manager.write_file(test_file, modified_content)
        assert file_manager.read_file(test_file) == modified_content
        
        # Restore the file
        file_manager.restore(test_file)
        assert file_manager.read_file(test_file) == original_content

    def test_backup_error(self, file_manager):
        with pytest.raises(PatchEvaluatorError):
            file_manager.backup("nonexistent.txt")

    def test_restore_nonexistent_backup(self, file_manager, test_dir):
        test_file = "test.txt"
        file_manager.write_file(test_file, "content")
        # Should not raise an error when backup doesn't exist
        file_manager.restore(test_file)

    def test_remove_backup(self, file_manager, test_dir):
        # Create a backup
        test_file = "test.txt"
        file_manager.write_file(test_file, "content")
        file_manager.backup(test_file)
        
        # Remove backups
        file_manager.remove_backup()
        assert not os.path.exists(os.path.join(test_dir, "backups"))
