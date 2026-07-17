from app.services.mongo import papers_collection


result = papers_collection.insert_one(
    {
        "test":"SCode Academic AI connection"
    }
)


print(result.inserted_id)