using ContactManagerAPI.Data;
using ContactManagerAPI.Models;
using ContactManagerAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ContactManagerAPI.Services;

public class DataService : IDataService
{
    private readonly ApplicationContext _applicationContext;

    public DataService(ApplicationContext applicationContext)
    {
        _applicationContext = applicationContext;
    }
    
    public async Task<IEnumerable<DataModel>> GetAllData()
    {
        var people = await _applicationContext.Users
            .Select(u => new DataModel
            {
                Id = u.Id,
                Name = u.Name,
                DateOfBirth = u.DateOfBirth,
                Married = u.Married,
                Phone = u.Phone,
                Salary = u.Salary
            })
            .ToListAsync();

        return people;
    }

    public async Task UpdateData(DataModel newData)
    {
        var existingData = await _applicationContext.Users.FindAsync(newData.Id);
        if (existingData != null)
        {
            existingData.Name = newData.Name;
            existingData.DateOfBirth = newData.DateOfBirth;
            existingData.Married = newData.Married;
            existingData.Phone = newData.Phone;
            existingData.Salary = newData.Salary;

            await _applicationContext.SaveChangesAsync();
        }
    }

    public async Task DeleteData(int id)
    {
        var person = await _applicationContext.Users.FindAsync(id);
        if (person != null)
        {
            _applicationContext.Users.Remove(person);
            await _applicationContext.SaveChangesAsync();
        }
    }
}