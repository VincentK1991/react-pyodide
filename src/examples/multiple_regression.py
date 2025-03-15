"""
Multiple Regression Analysis Example

This script demonstrates:
1. Generating random data with multiple predictors
2. Calculating correlation matrix
3. Performing multiple regression using statsmodels
4. Interpreting regression results
"""

import numpy as np
import statsmodels.api as sm
import pandas as pd

# Set a random seed for reproducibility
np.random.seed(42)

# Generate sample data with multiple predictors
n = 100  # number of observations

# Generate three independent variables
x1 = np.random.normal(0, 1, n)  # predictor 1
x2 = np.random.normal(0, 1, n)  # predictor 2
x3 = np.random.normal(0, 1, n)  # predictor 3

# Create dependent variable with known relationships
# y has strong relationship with x1, moderate with x2, and weak with x3
y = 0.8 * x1 + 0.4 * x2 + 0.1 * x3 + np.random.normal(0, 1, n)

# Create a DataFrame for easier data manipulation
data = pd.DataFrame({
    'y': y,
    'x1': x1,
    'x2': x2,
    'x3': x3
})

# Calculate and display correlation matrix
corr_matrix = data.corr()
print("Correlation Matrix:")
print(corr_matrix)
print("\n")

# Perform multiple regression
X = sm.add_constant(data[['x1', 'x2', 'x3']])  # Add constant term
model = sm.OLS(data['y'], X).fit()

# Print regression summary
print("Multiple Regression Results:")
print(f"R-squared: {model.rsquared:.4f}")
print(f"Adjusted R-squared: {model.rsquared_adj:.4f}")
print(f"F-statistic: {model.fvalue:.4f}")
print(f"Prob (F-statistic): {model.f_pvalue:.4e}")

# Print coefficient statistics
print("\nCoefficient Statistics:")
print(f"{'Parameter':<10} {'Coefficient':<12} {'Std Error':<12} {'t-value':<10} {'p-value':<10}")
print("-" * 60)
for i, name in enumerate(['const', 'x1', 'x2', 'x3']):
    print(f"{name:<10} {model.params[i]:<12.4f} {model.bse[i]:<12.4f} {model.tvalues[i]:<10.4f} {model.pvalues[i]:<10.4e}")

# Interpretation of results
print("\nInterpretation:")
print(f"1. The model explains {model.rsquared:.1%} of the variance in Y (R-squared).")
print("2. Coefficient interpretation:")

# Loop through predictors to provide interpretation
predictors = ['x1', 'x2', 'x3']
for i, pred in enumerate(predictors):
    coef = model.params[i+1]  # +1 to skip the constant
    p_val = model.pvalues[i+1]
    
    # Determine significance
    if p_val < 0.001:
        sig_level = "highly significant"
    elif p_val < 0.01:
        sig_level = "very significant"
    elif p_val < 0.05:
        sig_level = "significant"
    elif p_val < 0.1:
        sig_level = "marginally significant"
    else:
        sig_level = "not significant"
    
    print(f"   - {pred}: For each unit increase in {pred}, Y changes by {coef:.4f} units on average,")
    print(f"     holding other variables constant. This effect is {sig_level} (p={p_val:.4e}).")

# Variance Inflation Factor (VIF) for multicollinearity check
from statsmodels.stats.outliers_influence import variance_inflation_factor

# Calculate VIF for each predictor
vif_data = pd.DataFrame()
vif_data["Variable"] = X.columns
vif_data["VIF"] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]

print("\nVariance Inflation Factors (VIF):")
print(vif_data)
print("Note: VIF > 5 suggests potential multicollinearity issues.")

# Residual analysis
residuals = model.resid
print("\nResidual Analysis:")
print(f"Mean of residuals: {np.mean(residuals):.4e}")  # Should be close to zero
print(f"Standard deviation of residuals: {np.std(residuals):.4f}")

# Example of prediction with multiple predictors
new_data = pd.DataFrame({
    'x1': [0.5, 1.0],
    'x2': [0.3, -0.5],
    'x3': [0.1, 0.8]
})

# Add constant term
new_X = sm.add_constant(new_data)

# Make predictions
predictions = model.predict(new_X)

print("\nPredictions for new data points:")
for i in range(len(new_data)):
    print(f"Data point {i+1}:")
    print(f"  x1 = {new_data['x1'].iloc[i]:.2f}, x2 = {new_data['x2'].iloc[i]:.2f}, x3 = {new_data['x3'].iloc[i]:.2f}")
    print(f"  Predicted y = {predictions[i]:.4f}")

# Confidence intervals for the predictions
pred_conf = model.get_prediction(new_X).conf_int(alpha=0.05)
print("\nPrediction 95% Confidence Intervals:")
for i in range(len(new_data)):
    print(f"Data point {i+1}: [{pred_conf[i,0]:.4f}, {pred_conf[i,1]:.4f}]") 