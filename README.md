# Pyodide React App

A React application that demonstrates the power of running Python code directly in the browser using Pyodide.

## Features

- **Code Editor**: Write and execute Python or JavaScript code directly in your browser
- **Function Examples**: Interactive examples of Python functions with customizable parameters
- **Statistical Analysis Examples**: Pre-built examples for statistical analysis using NumPy, pandas, and statsmodels
- **AI Chat Assistant**: Get help with your code from an AI assistant (requires server connection)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pyodide-react-app.git
cd pyodide-react-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Code Editor

- Select a language (Python or JavaScript) from the dropdown
- Write your code in the editor
- Click "Run" to execute the code
- View the output in the panel below the editor
- For Python, you can install additional packages using the package installer

### Function Examples

- Switch to the "Function Examples" tab
- Each function example has two views:
  - **Explanation**: A description of what the function does
  - **Code**: The actual Python code for the function
- Customize the function parameters
- Click "Run Function" to execute the function with your parameters
- View the output in the panel below

### Statistical Analysis Examples

- In the Code Editor tab, use the "Select an example" dropdown to choose a statistical analysis example
- The example code will be loaded into the editor
- Click "Run" to execute the code
- View the results in the output panel

### AI Chat Assistant

- Click "Check Server" to verify if the AI server is online
- Click "Show Chat" to open the chat interface
- Type your questions about Python or JavaScript
- The AI will provide helpful answers and code examples

## Technologies Used

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Pyodide](https://pyodide.org/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Tailwind CSS](https://tailwindcss.com/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Pyodide](https://pyodide.org/) for making it possible to run Python in the browser
- [NumPy](https://numpy.org/), [pandas](https://pandas.pydata.org/), and [statsmodels](https://www.statsmodels.org/) for statistical analysis capabilities
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the powerful code editing experience
