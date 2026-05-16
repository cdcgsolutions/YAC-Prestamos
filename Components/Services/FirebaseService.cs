using Microsoft.JSInterop;
using MudApp.Components.Models;

namespace MudApp.Components.Services
{
    public class FirebaseService
    {
        private readonly IJSRuntime _js;

        public FirebaseService(IJSRuntime js)
        {
            _js = js;
        }

        private async Task<IJSObjectReference> GetModuleAsync()
        {
            return await _js.InvokeAsync<IJSObjectReference>("import", "./js/firebase-interop.js");
        }

        public async Task<ResultadoAccion> LoginAsync(string email, string password)
        {
            var module = await GetModuleAsync();
            return await module.InvokeAsync<ResultadoAccion>("loginWithEmail", email, password);
        }

        public async Task<ResultadoAccion> RegistrarUsuarioAsync(string nombre, string email, string password, bool habilitado, int idRol)
        {
            var module = await GetModuleAsync();
            return await module.InvokeAsync<ResultadoAccion>("registrarUsuario", nombre, email, password, habilitado, idRol);
        }

        public async Task<ResultadoRoles> ObtenerRolesAsync()
        {
            var module = await GetModuleAsync();
            return await module.InvokeAsync<ResultadoRoles>("obtenerRoles");
        }

        public async Task<ResultadoUsuario> ObtenerUsuarioAsync(string uid)
        {
            var module = await GetModuleAsync();
            return await module.InvokeAsync<ResultadoUsuario>("obtenerUsuario", uid);
        }

        public async Task<ResultadoUsuarios> ObtenerUsuariosAsync()
        {
            var module = await GetModuleAsync();
            return await module.InvokeAsync<ResultadoUsuarios>("obtenerUsuarios");
        }

        public async Task<ResultadoAccion> ActualizarUsuarioAsync(string idDocumento, string nombre, string email, string password, bool habilitado, int idRol)
        {
            var module = await GetModuleAsync();
            return await module.InvokeAsync<ResultadoAccion>("actualizarUsuario", idDocumento, nombre, email, password, habilitado, idRol);
        }

        public async Task<ResultadoAccion> RegistrarClienteAsync(string nombre, DateTime? fechaNacimiento, string estadoCivil, string direccion, string celular, string correo)
        {
            var module = await GetModuleAsync();
            return await module.InvokeAsync<ResultadoAccion>("registrarCliente", nombre, fechaNacimiento?.ToString("yyyy-MM-dd"), estadoCivil, direccion, celular, correo);
        }

        public async Task<ResultadoClientes> ObtenerClientesAsync()
        {
            var module = await GetModuleAsync();
            return await module.InvokeAsync<ResultadoClientes>("obtenerClientes");
        }

        public async Task<ResultadoAccion> ActualizarClienteAsync(string idDocumento, string nombre, DateTime? fechaNacimiento, string estadoCivil, string direccion, string celular, string correo, bool estaHabilitado)
        {
            var module = await GetModuleAsync();
            return await module.InvokeAsync<ResultadoAccion>("actualizarCliente", idDocumento, nombre, fechaNacimiento?.ToString("yyyy-MM-dd"), estadoCivil, direccion, celular, correo, estaHabilitado);
        }

    }
}
