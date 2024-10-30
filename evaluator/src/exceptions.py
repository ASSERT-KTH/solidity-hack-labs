class PatchEvaluatorError(Exception):
    """Base exception for patch evaluator."""
    pass

class PatchValidationError(PatchEvaluatorError):
    """Raised when patch validation fails."""
    pass

class PatchApplicationError(PatchEvaluatorError):
    """Raised when patch application fails."""
    pass

class UnsupportedPatchFormatError(PatchEvaluatorError):
    """Raised when patch format is not supported."""
    pass