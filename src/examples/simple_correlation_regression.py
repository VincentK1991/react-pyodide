"""
Simple Correlation and Regression Analysis Example

This script demonstrates:
1. Generating random data with a known correlation
2. Calculating correlation using NumPy
3. Performing linear regression using statsmodels
"""

import numpy as np
import statsmodels.api as sm

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
print(f"Intercept: {model.params[0]:.4f}")
print(f"Slope: {model.params[1]:.4f}")
print(f"R-squared: {model.rsquared:.4f}")
print(f"Adjusted R-squared: {model.rsquared_adj:.4f}")
print(f"F-statistic: {model.fvalue:.4f}")
print(f"Prob (F-statistic): {model.f_pvalue:.4e}")

# Print coefficient statistics
print("\nCoefficient Statistics:")
print(f"{'Parameter':<10} {'Coefficient':<12} {'Std Error':<12} {'t-value':<10} {'p-value':<10}")
print("-" * 60)
for i, name in enumerate(['const', 'x']):
    print(f"{name:<10} {model.params[i]:<12.4f} {model.bse[i]:<12.4f} {model.tvalues[i]:<10.4f} {model.pvalues[i]:<10.4e}")

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

# Example of prediction
new_x = np.array([0.5, 1.0, 1.5])  # New data points for prediction
new_X = sm.add_constant(new_x)  # Add constant term
predictions = model.predict(new_X)

print("\nPredictions for new X values:")
for i, x_val in enumerate(new_x):
    print(f"X = {x_val:.1f}, Predicted Y = {predictions[i]:.4f}")

# Confidence intervals for the predictions
pred_conf = model.get_prediction(new_X).conf_int(alpha=0.05)
print("\nPrediction 95% Confidence Intervals:")
for i, x_val in enumerate(new_x):
    print(f"X = {x_val:.1f}, CI: [{pred_conf[i,0]:.4f}, {pred_conf[i,1]:.4f}]") 