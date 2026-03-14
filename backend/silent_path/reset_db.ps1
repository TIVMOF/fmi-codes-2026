Write-Host "Resetting database..." -ForegroundColor Yellow

# Delete database
if (Test-Path "db.sqlite3") {
    Remove-Item "db.sqlite3"
    Write-Host "Deleted database" -ForegroundColor Green
}

# Delete users migrations
Write-Host "Cleaning users migrations..." -ForegroundColor Yellow
Get-ChildItem -Path "users\migrations" -Filter *.py |
    Where-Object { $_.Name -ne "__init__.py" } |
    Remove-Item

# Delete simulations migrations
Write-Host "Cleaning simulations migrations..." -ForegroundColor Yellow
Get-ChildItem -Path "simulations\migrations" -Filter *.py |
    Where-Object { $_.Name -ne "__init__.py" } |
    Remove-Item

# Create new migrations
Write-Host "Creating new migrations..." -ForegroundColor Yellow
python manage.py makemigrations users
python manage.py makemigrations simulations

# Apply migrations
Write-Host "Applying migrations..." -ForegroundColor Yellow
python manage.py migrate

Write-Host "Done!" -ForegroundColor Green