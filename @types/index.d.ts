declare module "solc" {
  function compile(options: string): string;
}

declare type ContractFile = {
  abi: string | readonly any[];
  devdoc: any;
  evm: {
    assembly: string;
    bytecode: {
      generatedSources: any[];
      object: string;
      opcodes: string;
      sourceMap: string;
    };
    deployesBytecode: {};
    gasEstimates: {};
    legacyAssembly: {};
    methodIdentifiers: {
      [identifier: string]: string;
    };
  };
  ewasm: any;
  metadata: string;
  storageLayout: {
    storage: any[];
    types: any;
  };
  userdoc: {
    kind: string;
    methods: {};
    version: number;
  };
};
