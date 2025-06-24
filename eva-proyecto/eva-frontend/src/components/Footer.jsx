const Footer = () => {
  return (
    <footer className=" bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 sm:px-8 py-3 sm:py-4 z-50">
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-600 gap-2 sm:gap-0">
        <span>Versión 4.6</span>
        <span className="text-center sm:text-right">
          Copyright © 2021{" "}
          <span className="text-blue-600 font-medium">
            EVA gestiona la tecnología
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
  );
};

export default Footer;
