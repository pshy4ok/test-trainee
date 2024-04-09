using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using ContactManagerAPI.Data;
using ContactManagerAPI.Models;
using ContactManagerAPI.Services.Interfaces;

namespace ContactManagerAPI.Services
{
    public class CsvService : ICsvService
    {
        private readonly ApplicationContext _applicationContext;

        public CsvService(ApplicationContext applicationContext)
        {
            _applicationContext = applicationContext;
        }
        
        public async Task ProcessCsvAsync(CsvUploadModel csvUploadModel)
        {
            using (var reader = new StreamReader(csvUploadModel.CsvFile.OpenReadStream(), Encoding.Default))
            {
                var csvConfiguration = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    HasHeaderRecord = true,
                    HeaderValidated = null,
                    MissingFieldFound = null,
                    TrimOptions = TrimOptions.Trim
                };
                
                using (var csv = new CsvReader(reader, csvConfiguration))
                {
                    try
                    {
                        var records = csv.GetRecords<Data.Entities.Data>().ToList();

                        foreach (var record in records)
                        {
                            var validationResults = new List<ValidationResult>();
                            var context = new ValidationContext(record);
                            if (!Validator.TryValidateObject(record, context, validationResults, true))
                            {
                                var errorMessages = validationResults
                                    .Select(vr => $"Row {records.IndexOf(record) + 1}: {vr.ErrorMessage}");
                                throw new InvalidOperationException(string.Join(Environment.NewLine, errorMessages));
                            }
                        }
                        
                        await _applicationContext.Users.AddRangeAsync(records);
                        await _applicationContext.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {
                        throw new InvalidOperationException($"Error processing CSV file. {ex}");
                    }
                }
            }
        }
    }
}
