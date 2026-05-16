using System.Collections.Generic;
using MudApp.Components.DTOs;

namespace MudApp.Components.Models
{
    public class ResultadoPrestamos
    {
        public bool Exito { get; set; }
        public string? Mensaje { get; set; }
        public List<PrestamoDTO>? Datos { get; set; }
    }
}
