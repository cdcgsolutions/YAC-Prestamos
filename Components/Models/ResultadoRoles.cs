using System.Collections.Generic;
using MudApp.Components.DTOs;

namespace MudApp.Components.Models
{
    public class ResultadoRoles
    {
        public bool Exito { get; set; }
        public string? Mensaje { get; set; }
        public List<RolDTO>? Datos { get; set; }
    }
}
