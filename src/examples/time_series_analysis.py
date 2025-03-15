"""
Time Series Analysis Example

This script demonstrates:
1. Creating a synthetic time series with trend and seasonality
2. Decomposing the time series into trend, seasonal, and residual components
3. Fitting an ARIMA model
4. Making forecasts with the model
"""

import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.arima.model import ARIMA
from datetime import datetime, timedelta

# Create a synthetic time series
np.random.seed(42)

# Generate dates for 3 years of monthly data
dates = pd.date_range(start='2020-01-01', periods=36, freq='M')

# Create components of the time series
trend = np.linspace(10, 30, 36)  # Upward trend
seasonality = 5 * np.sin(np.linspace(0, 6*np.pi, 36))  # Seasonal pattern with period 12
noise = np.random.normal(0, 1, 36)  # Random noise

# Combine components to create the time series
y = trend + seasonality + noise

# Create a pandas Series with the time series data
ts = pd.Series(y, index=dates)

print("Time Series Data (first 10 observations):")
print(ts.head(10))
print("\n")

# Plot the time series
print("Time Series Statistics:")
print(f"Mean: {ts.mean():.4f}")
print(f"Standard Deviation: {ts.std():.4f}")
print(f"Minimum: {ts.min():.4f}")
print(f"Maximum: {ts.max():.4f}")
print("\n")

# Decompose the time series
decomposition = seasonal_decompose(ts, model='additive', period=12)

# Extract components
trend_component = decomposition.trend
seasonal_component = decomposition.seasonal
residual_component = decomposition.resid

print("Time Series Decomposition:")
print("Trend Component (first 5 observations):")
print(trend_component.dropna().head(5))
print("\nSeasonal Component (first 12 observations):")
print(seasonal_component.head(12))
print("\nResidual Component (first 5 observations):")
print(residual_component.dropna().head(5))
print("\n")

# Fit an ARIMA model
# ARIMA(p,d,q) where:
# p = order of the autoregressive part
# d = degree of differencing
# q = order of the moving average part
model = ARIMA(ts, order=(1, 1, 1))  # ARIMA(1,1,1)
results = model.fit()

print("ARIMA Model Summary:")
print(f"AIC: {results.aic:.4f}")
print(f"BIC: {results.bic:.4f}")
print("\nARIMA Model Parameters:")
print(f"AR(1) coefficient: {results.arparams[0]:.4f}")
print(f"MA(1) coefficient: {results.maparams[0]:.4f}")
print("\n")

# Make forecasts
forecast_steps = 12  # Forecast 12 months ahead
forecast = results.forecast(steps=forecast_steps)
forecast_index = pd.date_range(start=ts.index[-1] + pd.DateOffset(months=1), periods=forecast_steps, freq='M')
forecast_series = pd.Series(forecast, index=forecast_index)

print("Forecast for the next 12 months:")
for date, value in forecast_series.items():
    print(f"{date.strftime('%Y-%m')}: {value:.4f}")

# Get forecast confidence intervals
pred_conf = results.get_forecast(steps=forecast_steps).conf_int()
lower_series = pd.Series(pred_conf.iloc[:, 0].values, index=forecast_index)
upper_series = pd.Series(pred_conf.iloc[:, 1].values, index=forecast_index)

print("\nForecast 95% Confidence Intervals:")
for i, date in enumerate(forecast_index):
    print(f"{date.strftime('%Y-%m')}: [{lower_series[i]:.4f}, {upper_series[i]:.4f}]")

# Calculate accuracy metrics on the historical data
# Use the last 6 months as a test set
train = ts[:-6]
test = ts[-6:]

# Fit the model on the training data
train_model = ARIMA(train, order=(1, 1, 1))
train_results = train_model.fit()

# Make predictions for the test period
predictions = train_results.forecast(steps=6)

# Calculate error metrics
mae = np.mean(np.abs(predictions - test.values))
rmse = np.sqrt(np.mean((predictions - test.values)**2))
mape = np.mean(np.abs((test.values - predictions) / test.values)) * 100

print("\nModel Accuracy Metrics (on last 6 months):")
print(f"Mean Absolute Error (MAE): {mae:.4f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
print(f"Mean Absolute Percentage Error (MAPE): {mape:.4f}%")

# Interpretation
print("\nInterpretation:")
print("1. The time series shows a clear upward trend with seasonal patterns.")
print(f"2. The ARIMA(1,1,1) model has an AIC of {results.aic:.4f}.")
print("3. The forecast predicts continued growth with seasonal fluctuations.")
print(f"4. The model has a MAPE of {mape:.2f}%, indicating its forecast accuracy.") 