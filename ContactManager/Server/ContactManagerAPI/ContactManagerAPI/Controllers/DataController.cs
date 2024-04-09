using ContactManagerAPI.Models;
using ContactManagerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ContactManagerAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class DataController : ControllerBase
{
    private readonly IDataService _dataService;

    public DataController(IDataService dataService)
    {
        _dataService = dataService;
    }
    
    [HttpGet("/data")]
    public async Task<ActionResult<IEnumerable<DataModel>>> GetAllData()
    {
        var users = await _dataService.GetAllData();
        return Ok(users);
    }
    
    [HttpPut("/{id}")]
    public async Task<IActionResult> UpdateData(int id, DataModel newData)
    {
        if (id != newData.Id)
        {
            return BadRequest();
        }

        try
        {
            await _dataService.UpdateData(newData);
            return Ok();
        }
        catch (DbUpdateConcurrencyException)
        {
            return NotFound();
        }
    }

    [HttpDelete("/data/{id}")]
    public async Task<IActionResult> DeleteData(int id)
    {
        await _dataService.DeleteData(id);
        return Ok();
    }
}