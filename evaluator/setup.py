from setuptools import setup, find_packages

setup(
    name="evaluator",
    version="0.1",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    python_requires=">=3.8",
    install_requires=[],  # Core dependencies (none currently needed)
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
        ],
    },
    description="A tool for evaluating patches",
    author="Monica Jin",
    author_email="monicachenjin@gmail.com",
)
