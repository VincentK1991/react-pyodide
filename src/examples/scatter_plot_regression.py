"""
Scatter Plot with Regression Line Example

This script demonstrates:
1. Generating random data with a known correlation
2. Creating a scatter plot of the data
3. Adding a regression line to the plot
4. Displaying the plot in the browser using Pyodide

Note: When running in Pyodide, the matplotlib output will be displayed
      directly in the browser.
"""

import numpy as np
import statsmodels.api as sm
import matplotlib.pyplot as plt

# Set a random seed for reproducibility
np.random.seed(42)

# Generate sample data with a known correlation
n = 50  # number of observations
x = np.random.normal(0, 1, n)  # independent variable from standard normal distribution
# Create y with a moderate positive correlation with x (correlation ≈ 0.7)
y = 0.7 * x + np.random.normal(0, 0.7, n)  # dependent variable

# Calculate correlation using NumPy
correlation = np.corrcoef(x, y)[0, 1]
print(f"Correlation coefficient: {correlation:.4f}")

# Perform simple linear regression using statsmodels
X = sm.add_constant(x)  # Add a constant (intercept) to the independent variable
model = sm.OLS(y, X).fit()  # Create and fit the model

# Print key regression results
print(f"Intercept: {model.params[0]:.4f}")
print(f"Slope: {model.params[1]:.4f}")
print(f"R-squared: {model.rsquared:.4f}")

# Create a scatter plot
plt.figure(figsize=(10, 6))
plt.scatter(x, y, alpha=0.7, label='Data points')

# Add regression line
x_line = np.linspace(min(x), max(x), 100)
y_line = model.params[0] + model.params[1] * x_line
plt.plot(x_line, y_line, 'r-', label=f'Regression line (y = {model.params[0]:.2f} + {model.params[1]:.2f}x)')

# Add labels and title
plt.xlabel('X variable')
plt.ylabel('Y variable')
plt.title(f'Scatter Plot with Regression Line (r = {correlation:.2f}, R² = {model.rsquared:.2f})')
plt.grid(True, alpha=0.3)
plt.legend()

# Add annotation with regression statistics
stats_text = f"Regression Statistics:\n" \
             f"Correlation (r): {correlation:.4f}\n" \
             f"R-squared: {model.rsquared:.4f}\n" \
             f"Intercept: {model.params[0]:.4f}\n" \
             f"Slope: {model.params[1]:.4f}\n" \
             f"p-value: {model.pvalues[1]:.4e}"
plt.annotate(stats_text, xy=(0.05, 0.95), xycoords='axes fraction', 
             bbox=dict(boxstyle="round,pad=0.5", fc="white", alpha=0.8),
             va='top', fontsize=9)

# In Pyodide, this will display the plot in the browser
plt.tight_layout()
plt.show()

print("Plot has been generated and should be displayed in the browser.") 