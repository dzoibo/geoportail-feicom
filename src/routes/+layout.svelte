<script lang="ts">
  import '../app.postcss';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Main from '../components/Map.svelte';
  import Papa from 'papaparse';
  // Autre fichier, par exemple, votre composant ou page
  import { uniqueValues } from '../../shared/utilitaire';
  import { dataStore } from '../../shared/store.js';

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
    Checkbox
  } from 'flowbite-svelte';
  import {
    ChevronDoubleUpOutline,
    FolderOutline,
    SwatchbookOutline,
    LandmarkOutline,
    ChevronDoubleDownOutline,
    DollarOutline,
    UsersGroupOutline,
    ChevronDownSolid
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
  let backdrop: boolean = false;
  let activateClickOutside = true;
  let drawerHidden: boolean = false;
  $: if (width >= breakPoint) {
    drawerHidden = false;
    activateClickOutside = false;
  } else {
    drawerHidden = true;
    activateClickOutside = true;
  }
  let navbarHeight = 0;
  let dataArr: any[] = [];
  let valeursAttribution: any[] = [];
  let valeursDomaine: any[] = [];
  let valeursSecteur: any[] = [];
  let valeursBeneficiaire: any[] = [];
  let valeursSourcefinancement: any[] = [];
  onMount(async function () {
    const file =
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGDmlwNMcXwsL8qD4yHrLdmZFvBTYhsguNNFedK7ysi3Tf_jO7vgfr9MccVzJYn-N8t41nBuLiqGCy/pub?gid=1430480319&single=true&output=tsv';

    Papa.parse(file, {
      download: true,
      delimiter: '	',
      header: true,
      dynamicTyping: true,
      complete: function (results: { data: any[] }) {
        console.log(results);
        // Résout la promesse avec les données
        dataArr = results.data;
        valeursAttribution = uniqueValues(dataArr, "Instance d'attribution");
        valeursSecteur = uniqueValues(dataArr, 'Secteurs');
        valeursDomaine = uniqueValues(dataArr, 'Domaines');
        valeursBeneficiaire = uniqueValues(dataArr, 'Bénéficiaire');
        valeursSourcefinancement = uniqueValues(dataArr, 'Source_financement');
        // Mettez à jour le store avec les valeurs d'attribution uniques
        // @ts-ignore
        dataStore.set(dataArr);
      },
      error: function (error: any) {
        // Rejette la promesse en cas d'erreur
        reject(error);
      }
    });

    const navbar = document.getElementById('myNavbar'); // Remplacez 'navbar' par l'ID réel de votre navbar
    if (navbar) {
      navbarHeight = navbar.clientHeight;
      console.log(navbarHeight);
    }

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

  $: activeUrl = $page.url.pathname;
  let spanClass = 'pl-2 self-center text-md text-gray-900 dark:text-white';
  let divClass = 'w-full md:block md:w-auto pr-8';
  let ulClass = 'flex flex-col p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-lg md:font-medium';

  function reject(error: any) {
    throw new Error('Function not implemented.');
  }
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />
<Navbar id="myNavbar" let:hidden let:toggle>
  <NavHamburger on:click={toggleDrawer} btnClass="ml-3 lg:hidden" />
  <NavBrand href="/" class="lg:ml-64">
    <img
      src={'/logo-plateforme_little.jpg'}
      alt="logo-plateforme"
      class="mx-auto max-w-full h-10"
    />
    <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white pl-4">
      Plateforme Urbaine Cameroun
    </span>
  </NavBrand>
  <!--  <NavHamburger on:click={toggle} /> -->
  <!--   <NavUl {hidden} {divClass} {ulClass}>
    <NavLi href="/">Home</NavLi>
    <NavLi href="/pages/about">About</NavLi>
    <NavLi href="https://github.com/shinokada/flowbite-sveltekit-responsive-sidebar-layout"
      >GitHub</NavLi
    >
  </NavUl> -->
</Navbar>
<Drawer
  transitionType="fly"
  {backdrop}
  {transitionParams}
  bind:hidden={drawerHidden}
  bind:activateClickOutside
  width="w-65"
  class="overflow-scroll pb-32"
  id="sidebar"
>
  <div class="flex items-center">
    <CloseButton on:click={() => (drawerHidden = true)} class="mb-4 dark:text-white lg:hidden" />
  </div>
  <Sidebar asideClass="w-54">
    <SidebarWrapper divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800">
      <SidebarGroup>
        <SidebarDropdownWrapper label="Bénéficiaire">
          <svelte:fragment slot="icon">
            <UsersGroupOutline
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
          <Button
            >Sélection des bénéficiaires<ChevronDownSolid
              class="w-3 h-3 ms-2 text-white dark:text-white"
            /></Button
          >
          <Dropdown class="w-48 p-3 overflow-y-auto space-y-1 text-sm">
            {#each valeursBeneficiaire as beneficiaires}
              <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Checkbox>{beneficiaires}</Checkbox>
              </li>
            {/each}
          </Dropdown>
        </SidebarDropdownWrapper>

        <SidebarDropdownWrapper label="Instance d'attribution">
          <svelte:fragment slot="icon">
            <LandmarkOutline
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
          <Button
            >Sélection des instances<ChevronDownSolid
              class="w-3 h-3 ms-2 text-white dark:text-white"
            /></Button
          >
          <Dropdown class="w-48 p-3 overflow-y-auto space-y-1 text-sm">
            {#each valeursAttribution as instances}
              <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Checkbox>{instances}</Checkbox>
              </li>
            {/each}
          </Dropdown>
        </SidebarDropdownWrapper>

        <SidebarDropdownWrapper label="Domaine">
          <svelte:fragment slot="icon">
            <FolderOutline
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
          <Button
            >Sélection des projets<ChevronDownSolid
              class="w-3 h-3 ms-2 text-white dark:text-white"
            /></Button
          >
          <Dropdown class="w-48 p-3 overflow-y-auto  space-y-1 text-sm">
            {#each valeursDomaine as domaines}
              <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Checkbox>{domaines}</Checkbox>
              </li>
            {/each}
          </Dropdown>
        </SidebarDropdownWrapper>

        <SidebarDropdownWrapper label="Secteur">
          <svelte:fragment slot="icon">
            <SwatchbookOutline
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
          <Button
            >Sélection des secteurs<ChevronDownSolid
              class="w-3 h-3 ms-2 text-white dark:text-white"
            /></Button
          >
          <Dropdown class="w-48 p-3 overflow-y-auto  space-y-1 text-sm">
            {#each valeursSecteur as secteurs}
              <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Checkbox>{secteurs}</Checkbox>
              </li>
            {/each}
          </Dropdown>
        </SidebarDropdownWrapper>

        <SidebarDropdownWrapper label="Financement">
          <svelte:fragment slot="icon">
            <DollarOutline
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
          <Button
            >Sélection des sources de financement<ChevronDownSolid
              class="w-3 h-3 ms-2 text-white dark:text-white"
            /></Button
          >
          <Dropdown class="w-48 p-3 overflow-y-auto  space-y-1 text-sm">
            {#each valeursSourcefinancement as financement}
              <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Checkbox>{financement}</Checkbox>
              </li>
            {/each}
          </Dropdown>
        </SidebarDropdownWrapper>
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Drawer>
<div
  class="flex mx-auto w-screen lg:p-0 md:p-4 sm:p-4"
  style="height: calc(100vh - {navbarHeight}px);"
>
  <main id="main" class="lg:ml-64 w-screen maplibregl-map">
    <slot />
  </main>
</div>

<style>
</style>
