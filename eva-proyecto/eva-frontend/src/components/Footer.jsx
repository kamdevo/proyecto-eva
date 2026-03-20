const Footer = () => {
  return (
    <div className=" pt-4 bg-transparent flex justify-center absolute bottom-0 w-full">
      <footer className=" bg-white border-t border-4 rounded-t-lg border-gray-200 px-4 sm:px-8 py-3 sm:py-4 z-50">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-600 gap-2 sm:gap-0">
          <span className="text-center sm:text-right">
            Copyright © 2025{" "}
            <span className="text-blue-600 font-medium">
              EVA gestiona la tecnología. Desarrollado por: innovación y desarrollo
            </span>
            .
            <span className="hidden sm:inline">
              {" "}
              Todos los derechos reservados.
            </span>
            <span className="sm:hidden block">
              Todos los derechos reservados.
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
