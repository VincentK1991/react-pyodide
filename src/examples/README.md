# Statistical Analysis Examples

This directory contains Python examples demonstrating various statistical analysis techniques using NumPy, pandas, and statsmodels. These examples are designed to work in the Pyodide environment, allowing you to run statistical analyses directly in your browser.

## Available Examples

### 1. Simple Correlation and Regression Analysis
**File:** `simple_correlation_regression.py`

This example demonstrates:
- Generating random data with a known correlation
- Calculating correlation coefficient using NumPy
- Performing simple linear regression using statsmodels
- Interpreting regression results and statistics

### 2. Scatter Plot with Regression Line
**File:** `scatter_plot_regression.py`

This example demonstrates:
- Creating a scatter plot of correlated data
- Adding a regression line to the plot
- Displaying regression statistics on the plot
- Visualizing the relationship between variables

### 3. Multiple Regression Analysis
**File:** `multiple_regression.py`

This example demonstrates:
- Working with multiple predictor variables
- Calculating a correlation matrix
- Performing multiple regression analysis
- Interpreting coefficients and their significance
- Checking for multicollinearity using VIF
- Making predictions with multiple predictors

### 4. Time Series Analysis
**File:** `time_series_analysis.py`

This example demonstrates:
- Creating a synthetic time series with trend and seasonality
- Decomposing a time series into its components
- Fitting an ARIMA model to time series data
- Making forecasts with confidence intervals
- Evaluating model accuracy with error metrics

## How to Use These Examples

1. Copy the code from any example into the code editor
2. Select "Python" as the language
3. Click "Run" to execute the code
4. View the output in the console

For examples that include matplotlib visualizations, the plots will be displayed directly in the browser when running in the Pyodide environment.

## Dependencies

These examples use the following Python libraries, which are available in the Pyodide environment:
- NumPy
- pandas
- statsmodels
- SciPy
- Matplotlib (for visualization examples)

## Learning Resources

If you're new to statistical analysis in Python, here are some resources to help you learn more:

- [NumPy Documentation](https://numpy.org/doc/stable/)
- [pandas Documentation](https://pandas.pydata.org/docs/)
- [statsmodels Documentation](https://www.statsmodels.org/stable/index.html)
- [Matplotlib Documentation](https://matplotlib.org/stable/contents.html)
- [Python for Data Analysis](https://wesmckinney.com/book/) by Wes McKinney 