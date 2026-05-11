using Microsoft.JSInterop;

namespace MudApp.Components.Helpers
{
    public class MensajeToastr : IMensajeToastr
    {
        private readonly IJSRuntime js;

        public MensajeToastr(IJSRuntime js)
        {
            this.js = js;
        }

        public async Task MostrarMensajeErrorWithTitle(string mensaje, string titulo)
        {
            await MostrarMensaje(mensaje, "error", titulo);
        }

        public async Task MostrarMensajeExitosoWithTitle(string mensaje, string titulo)
        {
            await MostrarMensaje(mensaje, "success", titulo);
        }

        public async Task MostrarMensajeInfoWithTitle(string mensaje, string titulo)
        {
            await MostrarMensaje(mensaje, "info", titulo);
        }

        public async Task MostrarMensajeWarningWithTitle(string mensaje, string titulo)
        {
            await MostrarMensaje(mensaje, "warning", titulo);
        }

        public async Task MostrarMensajeError(string mensaje)
        {
            await MostrarMensaje(mensaje, "error", null);
        }

        public async Task MostrarMensajeExitoso(string mensaje)
        {
            await MostrarMensaje(mensaje, "success", null);
        }

        public async Task MostrarMensajeInfo(string mensaje)
        {
            await MostrarMensaje(mensaje, "info", null);
        }

        public async Task MostrarMensajeWarning(string mensaje)
        {
            await MostrarMensaje(mensaje, "warning", null);
        }

        private async ValueTask MostrarMensaje(string mensaje, string tipoMensaje, string? titulo)
        {
            await js.InvokeVoidAsync("AlertsToastr", tipoMensaje, mensaje, titulo);
        }

        public async Task ClearToastrALL()
        {
            await js.InvokeVoidAsync("clearToastr");
        }
    }
}
