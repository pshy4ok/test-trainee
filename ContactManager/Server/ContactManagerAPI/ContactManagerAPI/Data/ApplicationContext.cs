using ContactManagerAPI.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ContactManagerAPI.Data;

public class ApplicationContext : DbContext
{
    public DbSet<Entities.Data> Users { get; set; }

    public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
    {
        
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Entities.Data>().ToTable("users")
            .HasKey(c => c.Id);
    }
}