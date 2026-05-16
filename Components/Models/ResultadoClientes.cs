using System.Collections.Generic;
using MudApp.Components.DTOs;

namespace MudApp.Components.Models
{
    public class ResultadoClientes
    {
        public bool Exito { get; set; }
        public string? Mensaje { get; set; }
        public List<ClienteDTO>? Datos { get; set; }
    }
}
