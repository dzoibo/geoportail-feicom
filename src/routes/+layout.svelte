<script lang="ts">
  import '../app.postcss';
  import { page } from '$app/stores';
  import { onMount, createEventDispatcher } from 'svelte';
  import Main from '../components/Map.svelte';
  import Papa from 'papaparse';
  // Autre fichier, par exemple, votre composant ou page
  import { uniqueValues, findMinMax } from '../../shared/utilitaire';
  import {
    dataStore,
    rangeValue,
    buttonICSP,
    rangeValueAccord,
    storeIndicateur5,
    storeIndicateur
  } from '../../shared/store.js';
  import { fetchData } from '../../shared/dataService.js';

  import {
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    Drawer,
    CloseButton,
    SidebarDropdownWrapper,
    Button,
    Dropdown,
    Checkbox,
    ButtonGroup,
    Range,
    Radio,
    Label,
    Progressbar,
    Tabs,
    TabItem
  } from 'flowbite-svelte';
  import {
    FolderOutline,
    SwatchbookOutline,
    LandmarkOutline,
    DollarOutline,
    UsersGroupOutline,
    ChevronDownSolid,
    CheckPlusCircleOutline
  } from 'flowbite-svelte-icons';
  import { Cog } from 'svelte-heros-v2';
  import { sineIn } from 'svelte/easing';

  let transitionParams = {
    x: -320,
    duration: 100,
    easing: sineIn
  };
  let breakPoint: number = 1024;
  let width: number;
  let height: number;
  let component;
  let props;
  let backdrop: boolean = false;
  let activateClickOutside = true;
  let drawerHidden: boolean = false;
  let navbarHeight = 0;
  let dataArr: any[] = [];
  let mandatData: any[] = [];
  let icspData: any[] = [];
  let valeursAttribution: any[] = [];
  let valeursDomaine: any[] = [];
  let valeursSecteur: any[] = [];
  let valeursBeneficiaire: any[] = [];
  let valeursSourcefinancement: any[] = [];
  let arrayAllIndicateurs: any[] = [];
  let loadingData = true;
  let drawerWidth = 0;
  let activeUrl;
  let showFinancement = false;
  let showICSP = true;
  let minMaxYear: {
    max: 2000;
    min: 2022;
  };
  let minMaxYearAccord = {
    min: 2000,
    max: 2020
  };

  let valueSliderAccord = [minMaxYearAccord.min, minMaxYearAccord.max];

  let minMaxYearICSP = {
    min: 2000,
    max: 2020
  };

  let valueSlideICSP = [minMaxYearICSP.min, minMaxYearICSP.max];

  let valueSliderLanding = 0;

  let valueSliderAccord2 = 0;
  let update = true;

  let showProgressBar = true; // Définissez la variable pour afficher la barre de progression
  let progressValue = 0; // Initialisez la valeur de la progression
  let minSliderValue = minMaxYearAccord.min;
  let maxSliderValue = minMaxYearAccord.max;
  let minSliderICSP = minMaxYearICSP.min;
  let maxSliderICSP = minMaxYearICSP.max;

  let checkedOptions: { [key: string]: boolean } = {};
  let dropdownSelectionIndicateur5 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur4 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur3 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur2 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur1 = { indicateur: '', data: [] };
  let dropdownSelectionsAll: any[] = [];

  let indicateur5 = 'Source_financement';
  let indicateur1 = "Instance d'attribution";
  let indicateur2 = 'Secteurs';
  let indicateur3 = 'Domaines';
  let indicateur4 = 'Bénéficiaire';

  onMount(async function () {
    try {
      const { mandatData, dataArr, icspData } = await fetchData();

      // Mettez à jour les propriétés individuelles du store
      dataStore.update((store) => {
        loadingData = false;
        store.icspData = icspData;
        store.dataArr = dataArr;
        store.mandatData = mandatData;

        return store;
      });

      valeursAttribution = uniqueValues(dataArr, indicateur1);
      valeursSecteur = uniqueValues(dataArr, indicateur2);

      valeursDomaine = uniqueValues(dataArr, indicateur3);
      valeursBeneficiaire = uniqueValues(dataArr, indicateur4);

      valeursSourcefinancement = uniqueValues(dataArr, indicateur5);

      dropdownSelectionIndicateur5.indicateur = indicateur5;
      dropdownSelectionIndicateur4.indicateur = indicateur4;
      dropdownSelectionIndicateur3.indicateur = indicateur3;
      dropdownSelectionIndicateur2.indicateur = indicateur2;
      dropdownSelectionIndicateur1.indicateur = indicateur1;

      // Ajoutez les objets à l'array dropdownSelections
      dropdownSelectionsAll.push(
        dropdownSelectionIndicateur5,
        dropdownSelectionIndicateur4,
        dropdownSelectionIndicateur3,
        dropdownSelectionIndicateur2,
        dropdownSelectionIndicateur1
      );

      minMaxYearICSP = findMinMax(icspData, 'ANNEE');
      minMaxYearAccord = findMinMax(dataArr, 'Année financement');

      valueSliderAccord = [minMaxYearAccord.min, minMaxYearAccord.max];

      valueSlideICSP = [minMaxYearICSP.min, minMaxYearICSP.max];

      rangeValue.set(valueSlideICSP);
      rangeValueAccord.set(valueSliderAccord);

      // Vérifiez si l'élément a été trouvé
      /*       if (drawer) {
        console.log(drawer);
        // Obtenez la largeur calculée du drawer
        const drawerWidth = drawer.offsetWidth;
        const widthTotal = navbar.clientWidth;
        console.log('Largeur de la barre latérale:', drawerWidth, 'pixels');
      } else {
        console.error("L'élément avec l'ID 'sidebar' n'a pas été trouvé.");
      }

*/
      // Sélectionnez l'élément du drawer par son identifiant
      const drawer = document.getElementById('sidebar');
      const navbar = document.getElementById('myNavbar'); // Remplacez 'navbar' par l'ID réel de votre navbar

      if (navbar) {
        navbarHeight = navbar.clientHeight;
      }
    } catch (error) {
      console.error(error);
    }

    loadData();
  });

  onMount(() => {
    if (width >= breakPoint) {
      drawerHidden = false;
      activateClickOutside = false;
    } else {
      drawerHidden = true;
      activateClickOutside = true;
    }
  });

  const toggleSide = () => {
    if (width < breakPoint) {
      drawerHidden = !drawerHidden;
    }
  };
  const toggleDrawer = () => {
    drawerHidden = false;
  };

  $: if (width >= breakPoint) {
    drawerHidden = false;
    activateClickOutside = false;
  } else {
    drawerHidden = true;
    activateClickOutside = true;
  }

  function toggleCheckbox(checkedOptions: { checked: boolean }, array, unique) {
    checkedOptions.checked = !checkedOptions.checked;

    updateSelectedWords(array, unique); // Mettre à jour les mots sélectionnés
  }

  function updateSelectedWords(array, unique) {
    update = true;
    //@ts-ignore
    setTimeout(() => {
      //Todo Automatisation pour prendre toutes les données des listes déroulantes.
      array.data = unique.filter((unique) => unique.checked).map((unique) => unique.key);
      console.log(array);

      // Vérifiez si un objet avec le même indicateur existe déjà dans arrayAllIndicateurs
      const existingIndicateurIndex = arrayAllIndicateurs.findIndex(
        (item) => item.indicateur === array.indicateur
      );

      if (existingIndicateurIndex !== -1) {
        // Mettez à jour 'data' de l'objet existant
        arrayAllIndicateurs[existingIndicateurIndex].data = array.data;
      } else {
        // Ajoutez un nouvel objet à arrayAllIndicateurs
        arrayAllIndicateurs.push(array);
      }

      update = false;
    }, 10);

    console.log(arrayAllIndicateurs);
    return array;
  }

  function closeDiv(
    wordToRemove: any,
    array: { indicateur: string; data: never[] } | undefined,
    unique
  ) {
    // Trouvez l'objet correspondant dans valeursSourcefinancement
    const word = unique.find((value) => value.key === wordToRemove);

    if (word) {
      // Mettez à jour la propriété checked de l'objet à false
      word.checked = false;
    }

    updateSelectedWords(array, unique); // Mettre à jour les mots sélectionnés
  }

  $: {
    if (minSliderValue <= maxSliderValue) {
      minSliderValue = minSliderValue;
    } else {
      minSliderValue = maxSliderValue;
    }
    if (maxSliderValue >= minSliderValue) {
      maxSliderValue = maxSliderValue;
    } else {
      maxSliderValue = minSliderValue;
    }
    if (minSliderICSP <= maxSliderICSP) {
      minSliderICSP = minSliderICSP;
    } else {
      minSliderICSP = maxSliderICSP;
    }
    if (maxSliderICSP >= minSliderICSP) {
      maxSliderICSP = maxSliderICSP;
    } else {
      maxSliderICSP = minSliderICSP;
    }

    valueSliderAccord = [minSliderValue, maxSliderValue];
    valueSlideICSP = [minSliderICSP, maxSliderICSP];
    //@ts-ignore
    rangeValue.set(valueSlideICSP);
    //@ts-ignore

    console.log(valueSliderAccord);
    rangeValueAccord.set(valueSliderAccord);

    activeUrl = $page.url.pathname;
    let spanClass = 'pl-2 self-center text-md text-gray-900 dark:text-white';
    let divClass = 'w-full md:block md:w-auto pr-8';
    let ulClass =
      'flex flex-col p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-lg md:font-medium';

    storeIndicateur.update((items) => {
      //@ts-ignore
      items = arrayAllIndicateurs;
      return items;
    });

    update = update;
  }
  async function loadData() {
    // Téléchargez votre data ici
    // Une fois la data téléchargée, masquez la barre de progression
    showProgressBar = false;
  }
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />
<Navbar id="myNavbar" let:hidden let:toggle>
  <NavHamburger onClick={toggleDrawer} btnClass="ml-3 lg:hidden" />
  <NavBrand href="/" class="lg:ml-64">
    <img src={'/logo-Feicom.png'} alt="Feicom" class="mx-auto max-w-full h-10" />
    <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white pl-4">
      Géoportail du FEICOM
    </span>
  </NavBrand>
  <NavHamburger on:click={toggle} />
  <!--   <NavUl {hidden} {divClass} {ulClass}>
    <NavLi href="/">Home</NavLi>
    <NavLi href="/pages/about">About</NavLi>
    <NavLi href="https://github.com/shinokada/flowbite-sveltekit-responsive-sidebar-layout"
      >GitHub</NavLi
    >
  </NavUl> -->
</Navbar>
{#if !loadingData}
  <Drawer
    transitionType="fly"
    {backdrop}
    {transitionParams}
    bind:hidden={drawerHidden}
    bind:activateClickOutside
    class="overflow-scroll pb-32 !p-2"
    id="sidebar"
  >
    <div class="flex items-center">
      <CloseButton on:click={() => (drawerHidden = true)} class="mb-4 dark:text-white lg:hidden" />
    </div>
    <Sidebar asideClass="w-54">
      <SidebarWrapper divClass="overflow-y-auto  rounded dark:bg-gray-800">
        <Tabs style="full" class="space-x-0 w-full flex !flex-nowrap">
          <TabItem
            class="w-full hover:text-blue-900"
            open
            on:click={() => {
              showICSP = true;
              showFinancement = false;
              buttonICSP.set(showICSP);
            }}
          >
            <div slot="title" class="flex items-center gap-1 hover:text-blue-900">
              <DollarOutline size="sm" />
              ICSP
            </div>
            <SidebarGroup id="icsp">
              <div class="flex items-center space-x-4">
                <div class="flex-1">
                  <Range
                    id="range-max"
                    min={minMaxYearICSP.min}
                    max={minMaxYearICSP.max}
                    bind:value={minSliderICSP}
                    step="1"
                  />
                </div>
                <div class="flex-1">
                  <Range
                    id="range-min"
                    min={minMaxYearICSP.min}
                    max={minMaxYearICSP.max}
                    bind:value={maxSliderICSP}
                    step="1"
                  />
                </div>
              </div>
              <p>
                Visualisation des données pour la période : {minSliderICSP + ' - ' + maxSliderICSP}
              </p>
              <h5
                class="mb-2 text-2xl font-bold tracking-tight text-center text-gray-900 dark:text-white"
              >
                ANNEE
              </h5>
            </SidebarGroup>
          </TabItem>

          <TabItem
            class="hover:text-blue-900  w-full"
            on:click={() => {
              showICSP = false;
              showFinancement = true;
              buttonICSP.set(showICSP);
            }}
          >
            <div slot="title" class="flex items-center gap-1 hover:text-blue-900">
              <CheckPlusCircleOutline size="sm" />
              Accord de financement
            </div>
            <SidebarGroup id="finance">
              <SidebarDropdownWrapper label="Bénéficiaire">
                <svelte:fragment slot="icon">
                  <UsersGroupOutline
                    class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  />
                </svelte:fragment>
                <Button color="green"
                  >Sélection des bénéficiaires<ChevronDownSolid
                    class="w-3 h-3 ms-2 text-white dark:text-white"
                  /></Button
                >
                <Dropdown class="w-48 p-3 overflow-y-auto space-y-1 text-sm">
                  {#each valeursBeneficiaire as beneficiaires}
                    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Checkbox
                        checked={beneficiaires.checked}
                        on:change={() =>
                          toggleCheckbox(
                            beneficiaires,
                            dropdownSelectionIndicateur4,
                            valeursBeneficiaire
                          )}>{beneficiaires.key}</Checkbox
                      >
                    </li>
                  {/each}
                </Dropdown>
                <div class="px-2 pt-1 pb-2">
                  {#if arrayAllIndicateurs}
                    {#each arrayAllIndicateurs as indicateur}
                      {#if indicateur.indicateur === dropdownSelectionIndicateur4.indicateur}
                        {#each indicateur.data as word (word)}
                          <div
                            class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-green-400 rounded-lg"
                          >
                            {word}
                            <CloseButton
                              on:click={() =>
                                closeDiv(word, dropdownSelectionIndicateur4, valeursBeneficiaire)}
                              class="absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                            />
                          </div>
                        {/each}
                      {/if}
                    {/each}
                  {/if}
                </div>
              </SidebarDropdownWrapper>

              <SidebarDropdownWrapper label="Instance">
                <svelte:fragment slot="icon">
                  <LandmarkOutline
                    class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  />
                </svelte:fragment>
                <Button color="green"
                  >Sélection des instances<ChevronDownSolid
                    class="w-3 h-3 ms-2 text-white dark:text-white"
                  /></Button
                >
                <Dropdown class="w-48 p-3 overflow-y-auto space-y-1 text-sm">
                  {#each valeursAttribution as instances}
                    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Checkbox
                        checked={instances.checked}
                        on:change={() =>
                          toggleCheckbox(
                            instances,
                            dropdownSelectionIndicateur1,
                            valeursAttribution
                          )}>{instances.key}</Checkbox
                      >
                    </li>
                  {/each}
                </Dropdown>
                <div class="px-2 pt-1 pb-2">
                  {#if arrayAllIndicateurs}
                    {#each arrayAllIndicateurs as indicateur}
                      {#if indicateur.indicateur === dropdownSelectionIndicateur1.indicateur}
                        {#each indicateur.data as word (word)}
                          <div
                            class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-green-400 rounded-lg"
                          >
                            {word}
                            <CloseButton
                              on:click={() =>
                                closeDiv(word, dropdownSelectionIndicateur1, valeursAttribution)}
                              class="absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                            />
                          </div>
                        {/each}
                      {/if}
                    {/each}
                  {/if}
                </div>
              </SidebarDropdownWrapper>

              <SidebarDropdownWrapper label="Domaine">
                <svelte:fragment slot="icon">
                  <FolderOutline
                    class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  />
                </svelte:fragment>
                <Button color="green"
                  >Sélection des projets<ChevronDownSolid
                    class="w-3 h-3 ms-2 text-white dark:text-white"
                  /></Button
                >
                <Dropdown class="w-48 p-3 overflow-y-auto  space-y-1 text-sm">
                  {#each valeursDomaine as domaines}
                    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Checkbox
                        checked={domaines.checked}
                        on:change={() =>
                          toggleCheckbox(domaines, dropdownSelectionIndicateur3, valeursDomaine)}
                        >{domaines.key}</Checkbox
                      >
                    </li>
                  {/each}
                </Dropdown>
                <div class="px-2 pt-1 pb-2">
                  {#if arrayAllIndicateurs}
                    {#each arrayAllIndicateurs as indicateur}
                      {#if indicateur.indicateur === dropdownSelectionIndicateur3.indicateur}
                        {#each indicateur.data as word (word)}
                          <div
                            class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-green-400 rounded-lg"
                          >
                            {word}
                            <CloseButton
                              on:click={() =>
                                closeDiv(word, dropdownSelectionIndicateur3, valeursDomaine)}
                              class="absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                            />
                          </div>
                        {/each}
                      {/if}
                    {/each}
                  {/if}
                </div>
              </SidebarDropdownWrapper>

              <SidebarDropdownWrapper label="Secteur">
                <svelte:fragment slot="icon">
                  <SwatchbookOutline
                    class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  />
                </svelte:fragment>
                <Button color="green"
                  >Sélection des secteurs<ChevronDownSolid
                    class="w-3 h-3 ms-2 text-white dark:text-white"
                  /></Button
                >
                <Dropdown class="w-48 p-3 overflow-y-auto  space-y-1 text-sm">
                  {#each valeursSecteur as secteurs}
                    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Checkbox
                        checked={secteurs.checked}
                        on:change={() =>
                          toggleCheckbox(secteurs, dropdownSelectionIndicateur2, valeursSecteur)}
                        >{secteurs.key}</Checkbox
                      >
                    </li>
                  {/each}
                </Dropdown>
                <div class="px-2 pt-1 pb-2">
                  {#if arrayAllIndicateurs}
                    {#each arrayAllIndicateurs as indicateur}
                      {#if indicateur.indicateur === dropdownSelectionIndicateur2.indicateur}
                        {#each indicateur.data as word (word)}
                          <div
                            class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-green-400 rounded-lg"
                          >
                            {word}
                            <CloseButton
                              on:click={() =>
                                closeDiv(word, dropdownSelectionIndicateur2, valeursSecteur)}
                              class="absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                            />
                          </div>
                        {/each}
                      {/if}
                    {/each}
                  {/if}
                </div>
              </SidebarDropdownWrapper>

              <SidebarDropdownWrapper label="Financement">
                <svelte:fragment slot="icon">
                  <DollarOutline
                    class="w-auto text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  />
                </svelte:fragment>

                <Button color="green"
                  >Sélection des sources de financement<ChevronDownSolid
                    class="w-3 h-3 ms-2 text-white dark:text-white"
                  /></Button
                >
                <Dropdown class="w-48 p-3 overflow-y-auto  space-y-1 text-sm">
                  {#each valeursSourcefinancement as financement}
                    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Checkbox
                        checked={financement.checked}
                        on:change={() =>
                          toggleCheckbox(
                            financement,
                            dropdownSelectionIndicateur5,
                            valeursSourcefinancement
                          )}>{financement.key}</Checkbox
                      >
                    </li>
                  {/each}
                </Dropdown>
                <div class="px-2 pt-1 pb-2">
                  {#if arrayAllIndicateurs}
                    {#each arrayAllIndicateurs as indicateur}
                      {#if indicateur.indicateur === dropdownSelectionIndicateur5.indicateur}
                        {#each indicateur.data as word (word)}
                          <div
                            class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-green-400 rounded-lg"
                          >
                            {word}
                            <CloseButton
                              on:click={() =>
                                closeDiv(
                                  word,
                                  dropdownSelectionIndicateur5,
                                  valeursSourcefinancement
                                )}
                              class="absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                            />
                          </div>
                        {/each}
                      {/if}
                    {/each}
                  {/if}
                </div>
              </SidebarDropdownWrapper>
              <h5
                class="mb-2 text-2xl font-bold tracking-tight text-center text-gray-900 dark:text-white"
              >
                ANNEE
              </h5>
              <SidebarGroup>
                <div class="flex items-center space-x-4">
                  <div class="flex-1">
                    <Range
                      id="range-max"
                      min={minMaxYearAccord.min}
                      max={minMaxYearAccord.max}
                      bind:value={minSliderValue}
                      step="1"
                    />
                  </div>
                  <div class="flex-1">
                    <Range
                      id="range-min"
                      min={minMaxYearAccord.min}
                      max={minMaxYearAccord.max}
                      bind:value={maxSliderValue}
                      step="1"
                    />
                  </div>
                </div>
                <p>
                  Visualisation des données pour la période : {minSliderValue +
                    ' - ' +
                    maxSliderValue}
                </p>
              </SidebarGroup>
            </SidebarGroup>
          </TabItem>
          <TabItem disabled>
            <div slot="title" class=" w-full items-center gap-1 hover:text-blue-900">
              <DollarOutline size="sm" />
              Dettes
            </div>
          </TabItem>
        </Tabs>
      </SidebarWrapper>
    </Sidebar>
  </Drawer>
{/if}

<div class="flex mx-auto lg:p-0 md:p-4 sm:p-4" style="height: calc(100vh - {navbarHeight}px);">
  <main id="main" class="lg:ml-[20rem] maplibregl-map">
    {#if !loadingData}
      <slot {showFinancement} {showICSP} />
    {/if}
  </main>
</div>
