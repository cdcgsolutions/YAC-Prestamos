using System.Collections.Generic;
using MudApp.Components.DTOs;

namespace MudApp.Components.Models
{
    public class ResultadoPagos
    {
        public bool Exito { get; set; }
        public string? Mensaje { get; set; }
        public List<PagoDTO>? Datos { get; set; }
    }
}
