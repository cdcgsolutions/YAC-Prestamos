using System.Collections.Generic;
using MudApp.Components.DTOs;

namespace MudApp.Components.Models
{
    public class ResultadoUsuarios
    {
        public bool Exito { get; set; }
        public string? Mensaje { get; set; }
        public List<UsuarioDTO>? Datos { get; set; }
    }
}
