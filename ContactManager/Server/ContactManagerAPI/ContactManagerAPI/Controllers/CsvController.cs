using Microsoft.AspNetCore.Mvc;
using ContactManagerAPI.Models;
using ContactManagerAPI.Services.Interfaces;

namespace ContactManagerAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CsvController : ControllerBase
    {
        private readonly ICsvService _csvService;

        public CsvController(ICsvService csvService)
        {
            _csvService = csvService;
        }

        [HttpPost("/csv")]
        public async Task<IActionResult> UploadCsv([FromForm] CsvUploadModel csvUploadModel)
        {
            try
            {
                await _csvService.ProcessCsvAsync(csvUploadModel);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}