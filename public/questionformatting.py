import re

# Function to read the file
def read_file(file_path):
    with open(file_path, 'r') as file:
        return file.readlines()

# Function to parse the question into the required format
def parse_question(question_text):
    # Regular expression to extract subject, question, options, and answer
    question_data = {}

    # Match subject (assuming it comes before the question)
    subject_match = re.match(r'([A-Za-z\s]+)\s+Short Answer', question_text)
    if subject_match:
        question_data['subject'] = subject_match.group(1).strip()
    
    # Extract the question itself (everything up to "ANSWER")
    question_match = re.match(r'(\d+)\)\s*(.*?)\s*ANSWER:', question_text)
    if question_match:
        question_data['question'] = question_match.group(2).strip()
    
    # Extract the answer (after "ANSWER: ")
    answer_match = re.search(r'ANSWER:\s*(\w+)', question_text)
    if answer_match:
        question_data['answer'] = answer_match.group(1).strip()

    # Match the options (assuming they are marked as A), B), etc.)
    options_match = re.findall(r'([A-D])\)\s*([A-Za-z\s]+)', question_text)
    question_data['options'] = {opt[0]: opt[1].strip() for opt in options_match}
    
    return question_data

# Function to format the data into SQL insert statements
def format_to_sql(parsed_questions):
    sql_statements = []
    
    for question in parsed_questions:
        # For each question, generate an insert statement
        question_text = question['question']
        options = question['options']
        correct_answer = question['answer']
        
        # Get the options in the correct order (A, B, C, D)
        option_1 = options.get('W', '')
        option_2 = options.get('X', '')
        option_3 = options.get('Y', '')
        option_4 = options.get('Z', '')
        
        sql = f"INSERT INTO multiple_choice_questions (subject, question_text, option_1, option_2, option_3, option_4, correct_answer) VALUES ('{question['subject']}', '{question_text}', '{option_1}', '{option_2}', '{option_3}', '{option_4}', '{correct_answer}');"
        sql_statements.append(sql)
    
    return sql_statements

# Function to write SQL statements to an output file
def write_to_file(output_file_path, sql_statements):
    with open(output_file_path, 'w') as output_file:
        for statement in sql_statements:
            output_file.write(statement + '\n')

# Main function to handle the flow
def main(input_file, output_file):
    # Step 1: Read the raw data from the text file
    lines = read_file(input_file)
    
    # Step 2: Parse the questions
    parsed_questions = []
    current_question = ""
    
    for line in lines:
        if line.strip() == "":  # If empty line, skip
            continue
        
        # Concatenate lines of one question
        current_question += line.strip() + " "
        
        # Look for "ANSWER:" to know the end of the question
        if "ANSWER:" in current_question:
            parsed_question = parse_question(current_question)
            parsed_questions.append(parsed_question)
            current_question = ""  # Reset for the next question
    
    # Step 3: Format questions into SQL statements
    sql_statements = format_to_sql(parsed_questions)
    
    # Step 4: Write the SQL statements to a file
    write_to_file(output_file, sql_statements)
    print(f"SQL statements written to {output_file}")

# Call the main function
input_file = 'questions.txt'  # Path to your raw text file with questions
output_file = 'formatted_questions.sql'  # Output file for SQL insert statements
main(input_file, output_file)
