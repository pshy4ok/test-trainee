using ContactManagerAPI.Models;

namespace ContactManagerAPI.Services.Interfaces;

public interface ICsvService
{
    Task ProcessCsvAsync(CsvUploadModel csvUploadModel);
}