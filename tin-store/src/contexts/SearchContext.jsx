import { createContext, useState, useContext } from "react";
import { useContextResults } from "./ResultsContext";

const SearchContext = createContext();

export const SearchContextProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const { setFinalResults } = useContextResults();

  const handleSearch = async (packageName) => {

    const result = handleSearchIn(packageName);

    setSearch(packageName);

    setFinalResults(result)

    return result;
  };

  const handleSearchIn = async (packageName) => {
    console.log(packageName);
    if (!packageName) return;

    try {
      const packageData = await window.electron.searchPackage(packageName);

      return packageData.error || packageData.message || packageData;
    } catch (err) {
      console.log(err);

      return err.message;
    }
  };

  return (
    <SearchContext.Provider value={{ search, setSearch, handleSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useContextSearch = () => useContext(SearchContext);
