import React from "react";
import FunctionBox from "./FunctionBox";

const FunctionExamples: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Interactive Function Examples
      </h2>

      <FunctionBox
        title="Simple Addition"
        explanation="This function takes two numbers as input and returns their sum. It demonstrates basic arithmetic operations in Python."
        defaultCode={`def addition(a, b):
    """
    Add two numbers and return the result.
    
    Parameters:
    a (number): First number
    b (number): Second number
    
    Returns:
    number: The sum of a and b
    """
    return a + b`}
        parameterNames={["a", "b"]}
        parameterTypes={["number", "number"]}
        parameterDefaults={[5, 3]}
      />

      <FunctionBox
        title="String Manipulation"
        explanation="This function takes a string and a boolean flag. If the flag is true, it returns the string in uppercase; otherwise, it returns the string in lowercase."
        defaultCode={`def transform_text(text, uppercase):
    """
    Transform text to uppercase or lowercase based on the uppercase flag.
    
    Parameters:
    text (string): The text to transform
    uppercase (boolean): If True, convert to uppercase; otherwise, convert to lowercase
    
    Returns:
    string: The transformed text
    """
    if uppercase:
        return text.upper()
    else:
        return text.lower()`}
        parameterNames={["text", "uppercase"]}
        parameterTypes={["string", "boolean"]}
        parameterDefaults={["Hello World", true]}
      />

      <FunctionBox
        title="List Processing"
        explanation="This function takes a list of numbers and filters out all numbers that are less than the specified threshold. It demonstrates list comprehension and filtering in Python."
        defaultCode={`def filter_numbers(threshold, numbers_str):
    """
    Filter numbers that are greater than or equal to the threshold.
    
    Parameters:
    threshold (number): The minimum value to include
    numbers_str (string): Comma-separated list of numbers
    
    Returns:
    list: Filtered list of numbers
    """
    # Parse the comma-separated string into a list of numbers
    numbers = [float(n.strip()) for n in numbers_str.split(',') if n.strip()]
    
    # Filter numbers based on threshold
    filtered = [n for n in numbers if n >= threshold]
    
    return filtered`}
        parameterNames={["threshold", "numbers_str"]}
        parameterTypes={["number", "string"]}
        parameterDefaults={[10, "5, 10, 15, 20, 25"]}
      />

      <FunctionBox
        title="Fibonacci Sequence"
        explanation="This function generates the Fibonacci sequence up to the specified number of terms. It demonstrates recursive functions and sequence generation in Python."
        defaultCode={`def fibonacci(n):
    """
    Generate Fibonacci sequence up to n terms.
    
    Parameters:
    n (number): Number of terms to generate
    
    Returns:
    list: Fibonacci sequence
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    
    return fib`}
        parameterNames={["n"]}
        parameterTypes={["number"]}
        parameterDefaults={[10]}
      />
    </div>
  );
};

export default FunctionExamples;
