using ContactManagerAPI.Models;

namespace ContactManagerAPI.Services.Interfaces;

public interface IDataService
{
    Task<IEnumerable<DataModel>> GetAllData();
    Task UpdateData(DataModel newData);
    Task DeleteData(int id);
}