import sqlite3

DATABASE = "UK_School.db"
conn = sqlite3.connect(DATABASE)
data = conn.cursor() 

# data.execute("SELECT * FROM Student")

# Write a query to display all merits showing the student's 
# full name, teacher's full name, date awarded and reason.
data.execute("""SELECT Student.FirstName, Student.LastName, Teacher.FirstName, Teacher.LastName, DateAwarded, Reason
              FROM Teacher, Student, Merit
             LIMIT 100
             """)

for row in data:
    print(row)

data.close()