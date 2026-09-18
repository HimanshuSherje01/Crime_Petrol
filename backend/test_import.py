import traceback
try:
    import fastapi
    print("Successfully imported fastapi!")
except Exception as e:
    print("Caught an exception!")
    traceback.print_exc()
