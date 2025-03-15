"""
Correlation and Regression Analysis Example

This script demonstrates:
1. Generating random data with a known correlation
2. Calculating correlation using NumPy
3. Performing linear regression using statsmodels
4. Visualizing the results
"""

import numpy as np
import statsmodels.api as sm
import matplotlib.pyplot as plt
from statsmodels.graphics.regressionplots import abline_plot

# Set a random seed for reproducibility
np.random.seed(42)

# Generate sample data with a known correlation
n = 100  # number of observations
x = np.random.normal(0, 1, n)  # independent variable from standard normal distribution
# Create y with a moderate positive correlation with x (correlation ≈ 0.7)
y = 0.7 * x + np.random.normal(0, 0.7, n)  # dependent variable

# Calculate correlation using NumPy
correlation = np.corrcoef(x, y)[0, 1]
print(f"Correlation coefficient: {correlation:.4f}")

# Perform simple linear regression using statsmodels
# Add a constant (intercept) to the independent variable
X = sm.add_constant(x)

# Create a linear regression model and fit it to the data
model = sm.OLS(y, X).fit()

# Print regression summary
print("\nRegression Summary:")
print(model.summary().tables[1])  # Print only the coefficient table

# Calculate predictions for plotting
x_pred = np.linspace(min(x), max(x), 100)
X_pred = sm.add_constant(x_pred)
y_pred = model.predict(X_pred)

# Create a scatter plot with regression line
plt.figure(figsize=(10, 6))
plt.scatter(x, y, alpha=0.6, label='Data Points')
plt.plot(x_pred, y_pred, 'r-', label=f'Regression Line: y = {model.params[1]:.4f}x + {model.params[0]:.4f}')
plt.title(f'Correlation: {correlation:.4f}, R-squared: {model.rsquared:.4f}')
plt.xlabel('X Variable')
plt.ylabel('Y Variable')
plt.legend()
plt.grid(True, alpha=0.3)

# Add text with regression statistics
stats_text = (
    f"Regression Statistics:\n"
    f"Slope: {model.params[1]:.4f}\n"
    f"Intercept: {model.params[0]:.4f}\n"
    f"R-squared: {model.rsquared:.4f}\n"
    f"p-value: {model.pvalues[1]:.4e}"
)
plt.annotate(stats_text, xy=(0.05, 0.95), xycoords='axes fraction', 
             bbox=dict(boxstyle="round,pad=0.5", fc="white", alpha=0.8),
             va='top', fontsize=10)

# Show the plot (this would display in a Jupyter notebook or when run locally)
# In Pyodide, we'll need to convert this to a format that can be displayed in the browser

# Interpretation of results
print("\nInterpretation:")
print(f"1. The correlation coefficient of {correlation:.4f} indicates a strong positive relationship between X and Y.")
print(f"2. The regression model explains {model.rsquared:.1%} of the variance in Y (R-squared).")
print(f"3. For each unit increase in X, Y increases by {model.params[1]:.4f} units on average.")
print(f"4. The p-value of {model.pvalues[1]:.4e} indicates that this relationship is statistically significant.")

# Additional analysis: Residuals
residuals = model.resid
print("\nResidual Analysis:")
print(f"Mean of residuals: {np.mean(residuals):.4e}")  # Should be close to zero
print(f"Standard deviation of residuals: {np.std(residuals):.4f}")

# Example of how to test for normality of residuals
from scipy import stats
_, normality_p_value = stats.normaltest(residuals)
print(f"Normality test p-value: {normality_p_value:.4f}")
print("Interpretation: If p-value > 0.05, residuals are approximately normally distributed.")

# Example of how to check for heteroscedasticity
# Plot residuals vs. fitted values
plt.figure(figsize=(10, 6))
plt.scatter(model.fittedvalues, residuals, alpha=0.6)
plt.axhline(y=0, color='r', linestyle='-')
plt.title('Residuals vs Fitted Values')
plt.xlabel('Fitted Values')
plt.ylabel('Residuals')
plt.grid(True, alpha=0.3)

# Add a horizontal line at y=0 for reference
plt.axhline(y=0, color='r', linestyle='-')

# Show the plot (this would display in a Jupyter notebook or when run locally)
# In Pyodide, we'll need to convert this to a format that can be displayed in the browser 